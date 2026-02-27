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

import { usePosts, useTopPosts, useCategories, useUserProfile, useLikePost, useRepostPost, useDeletePost, useUpdatePost } from '../../hooks/usePosts';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Queries
  const { data: categories = [] } = useCategories();
  const { data: topPosts = [] } = useTopPosts();
  const { data: currentUser } = useUserProfile();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  // Derive categoryId from name
  const selectedCategory = categories.find((c: any) => c.name === currentCategory);
  const categoryId = selectedCategory ? selectedCategory._id : null;

  const { data: posts = [], isLoading: loading } = usePosts(categoryId, currentSearch);

  // Mutations
  const likeMutation = useLikePost();
  const repostMutation = useRepostPost();
  const deleteMutation = useDeletePost();
  const updateMutation = useUpdatePost();

  // Edit Post Modal State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostForm, setEditPostForm] = useState({ title: '', content: '' });

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

  // --- Post Edit ---
  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditPostForm({
      title: post.title || '',
      content: post.content || '',
    });
  };

  const handleSavePost = async () => {
    if (!editingPost?._id) return;
    try {
      await updateMutation.mutateAsync({ id: editingPost._id, data: editPostForm });
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
      <div className="flex flex-col lg:flex-row gap-16 py-10 px-4 xl:px-0 max-w-7xl mx-auto">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-2xl lg:ml-auto lg:mr-auto border-none pr-0 lg:pr-0">

          {/* Search Bar */}
          <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-[#707070]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search stories..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#1f1f1f] rounded-full border-none focus:ring-0 focus:bg-white dark:focus:bg-[#252525] focus:outline focus:outline-1 focus:outline-gray-300 dark:focus:outline-[#333333] transition-colors text-sm placeholder:text-gray-500 dark:placeholder:text-[#707070] text-gray-900 dark:text-[#e0e0e0]"
              value={currentSearch}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) params.set('search', e.target.value);
                else params.delete('search');
                router.push(`/feed?${params.toString()}`);
              }}
            />
          </div>

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
            <div className="text-center py-20 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg mt-8">
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
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden lg:block w-80 sticky top-24 h-fit space-y-10">

          {/* Staff Picks */}
          <div>
            <h3 className="font-bold text-base mb-5 text-gray-900 dark:text-[#e0e0e0]">Staff Picks</h3>
            <div className="space-y-5">
              {topPosts.slice(0, 3).map((post: any) => (
                <div key={post._id} className="group cursor-pointer" onClick={() => router.push(`/posts/${post._id}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={post.author?.avatar}
                      fallback={post.author?.userName || '?'}
                      alt={post.author?.userName}
                      size="sm"
                      className="w-5 h-5 text-[10px]"
                    />
                    <span className="text-xs font-medium text-gray-800 dark:text-[#999999]">{post.author?.userName}</span>
                  </div>
                  <h4 className="font-extrabold text-[15px] leading-snug text-gray-900 dark:text-[#e0e0e0] group-hover:underline line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#707070] mt-1.5">
                    <span className="text-amber-500 text-[10px]">✦</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/feed?sort=popular" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium mt-5 inline-block transition-colors">
              See the full list
            </Link>
          </div>

          {/* Recommended Topics */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-[#e0e0e0]">Recommended topics</h3>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 7).map((cat: any) => (
                  <button
                    key={cat._id}
                    onClick={() => updateFilters(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentCategory === cat.name
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-[#252525] text-gray-700 dark:text-[#999999] hover:bg-gray-200 dark:hover:bg-[#333333]'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 dark:text-[#707070] pt-4 border-t border-gray-100 dark:border-[#333333]">
            <a href="#" className="hover:text-gray-600 dark:hover:text-[#999999]">Help</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-[#999999]">Status</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-[#999999]">Privacy</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-[#999999]">Terms</a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-[#999999]">About</a>
          </div>
        </div>
      </div>

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-[#1f1f1f] shadow-2xl dark:shadow-black/50 rounded-2xl p-8 border border-gray-100 dark:border-[#333333] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold dark:text-[#e0e0e0]">Edit Story</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-400 dark:text-[#707070] hover:text-gray-600 dark:hover:text-[#999999] transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-[#999999] mb-2 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  className="w-full text-2xl font-bold font-serif placeholder:text-gray-300 dark:placeholder:text-[#707070] border-b border-gray-200 dark:border-[#333333] focus:border-black dark:focus:border-white outline-none py-3 transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editPostForm.title}
                  onChange={(e) => setEditPostForm({ ...editPostForm, title: e.target.value })}
                  placeholder="Story title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-[#999999] mb-2 uppercase tracking-wide">Content</label>
                <textarea
                  className="w-full text-lg font-serif leading-relaxed placeholder:text-gray-300 dark:placeholder:text-[#707070] border border-gray-200 dark:border-[#333333] rounded-lg focus:border-black dark:focus:border-white outline-none p-4 transition bg-transparent text-gray-900 dark:text-[#e0e0e0] resize-y min-h-[200px]"
                  value={editPostForm.content}
                  onChange={(e) => setEditPostForm({ ...editPostForm, content: e.target.value })}
                  placeholder="Tell your story..."
                  rows={10}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="ghost"
                onClick={() => setEditingPost(null)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePost}
                isLoading={updateMutation.isPending}
                disabled={!editPostForm.title.trim() || !editPostForm.content.trim()}
                className="rounded-full px-6 bg-green-600 hover:bg-green-700 text-white border-none"
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
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