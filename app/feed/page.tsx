"use client";
import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { MainLayout } from '../../components/layout/MainLayout';
import { PostCard } from '../../components/features/PostCard';
import { CategoryTabs } from '../../components/features/CategoryTabs';
import { Spinner } from '../../components/ui/Spinner';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import Link from 'next/link';
import { EditPostModal } from '../../components/features/EditPostModal';

import {
  usePosts,
  useTopPosts,
  useCategories,
  useUserProfile,
  useLikePost,
  useRepostPost,
  useDeletePost,
  useUpdatePost,
  useBookmarkPost,
  useUserBookmarks
} from '../../hooks/usePosts';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Queries
  const { data: categories = [] } = useCategories();
  const { data: topPosts = [] } = useTopPosts();
  const { data: currentUser } = useUserProfile();
  const { data: userBookmarks = [] } = useUserBookmarks();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  // Derive categoryId from name
  const selectedCategory = categories.find((c: any) => c.name === currentCategory);
  const categoryId = selectedCategory ? selectedCategory._id : null;

  const { data: rawPosts = [], isLoading: loading } = usePosts(categoryId, currentSearch);

  // Mark posts as bookmarked locally
  const posts = React.useMemo(() => {
    const bookmarkIds = new Set(userBookmarks.map((b: any) => (b._id || b)));
    return rawPosts.map((post: any) => ({
      ...post,
      isBookmarked: bookmarkIds.has(post._id)
    }));
  }, [rawPosts, userBookmarks]);

  // Mutations
  const likeMutation = useLikePost();
  const repostMutation = useRepostPost();
  const deleteMutation = useDeletePost();
  const updateMutation = useUpdatePost();
  const bookmarkMutation = useBookmarkPost();

  // Edit Post Modal State
  const [editingPost, setEditingPost] = useState<any>(null);

  const focusSearch = searchParams.get('focus') === 'search';
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      const params = new URLSearchParams(searchParams);
      params.delete('focus');
      router.replace(`/feed${params.toString() ? '?' + params.toString() : ''}`);
    }
  }, [focusSearch, searchParams, router]);

  const updateFilters = (category: string) => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (currentSearch) params.set('search', currentSearch);
    router.push(`/feed?${params.toString()}`);
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleRepost = (postId: string) => {
    repostMutation.mutate(postId);
  };

  const handleBookmark = (postId: string) => {
    bookmarkMutation.mutate(postId);
  };

  // --- Post Edit ---
  const handleEditPost = (post: any) => {
    setEditingPost(post);
  };

  const handleSavePost = async (data: { title: string; content: string }) => {
    if (!editingPost?._id) return;
    try {
      await updateMutation.mutateAsync({ id: editingPost._id, data });
      toast.success("Story updated successfully");
      setEditingPost(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update story");
    }
  };

  // --- Post Delete ---
  const handleDeletePost = async (postId: string) => {
    try {
      await deleteMutation.mutateAsync(postId);
      toast.success("Story deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete story");
    }
  };

  return (
    <MainLayout currentUser={currentUser}>
      <div className="py-8">
        <CategoryTabs
          categories={categories}
          currentCategory={currentCategory}
          onSelect={updateFilters}
        />

        {loading ? (
          <div className="space-y-10 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-32 h-4" />
                </div>
                <Skeleton className="w-full h-48 rounded-md" />
                <Skeleton className="w-3/4 h-6" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#1E293B] rounded-lg mt-8">
            <p className="text-gray-500 dark:text-[#999999] mb-4">No stories found.</p>
            <Link href="/create-post" className="text-black dark:text-white font-medium underline">
              Write the first story
            </Link>
          </div>
        ) : (
          <div className="space-y-0 mt-2">
            {posts.map((post: any) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onLike={handleLike}
                onRepost={handleRepost}
                onBookmark={handleBookmark}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePost}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Floating Action Button (Mobile/Tablet) */}
      <Link
        href="/create-post"
        className="lg:hidden fixed bottom-8 right-8 w-14 h-14 bg-brand-orange text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:rotate-12 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </MainLayout>
  );
}

export default function Feed() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <FeedContent />
    </Suspense>
  );
}