"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../services/api';
import { MainLayout } from '../../components/layout/MainLayout';
import { PostCard } from '../../components/features/PostCard';
import { CategoryTabs } from '../../components/features/CategoryTabs';
import { Spinner } from '../../components/ui/Spinner';
import { Skeleton } from '../../components/ui/Skeleton';
import Link from 'next/link';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catsRes, userRes, topPostsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users/profile').catch(() => null),
          api.get('/posts?sort=popular&limit=5')
        ]);

        setCategories(catsRes.data.data || catsRes.data || []);
        setTopPosts(topPostsRes.data.data || topPostsRes.data || []);

        if (userRes) {
          setCurrentUser(userRes.data.data || userRes.data || null);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    fetchInitialData();
  }, []);

  const loadFeedData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/posts?limit=20'; // Default is sorting by createdAt (latest)
      if (currentCategory !== 'All') {
        const cat = categories.find(c => c.name === currentCategory);
        if (cat) url += `&category=${cat._id}`;
      }
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

      const postsRes = await api.get(url);
      setPosts(postsRes.data.data || postsRes.data || []);
    } catch (err) {
      console.error("Feed error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, categories]);

  useEffect(() => {
    if (categories.length > 0 || currentCategory === 'All') {
      loadFeedData();
    }
  }, [loadFeedData, categories.length]);

  const updateFilters = (category: string) => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (currentSearch) params.set('search', currentSearch);
    router.push(`/feed?${params.toString()}`);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const updated = res.data.data || res.data;

      // Update in both lists if present
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, likes: updated.likes } : p))
      );
      setTopPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, likes: updated.likes } : p))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <MainLayout currentUser={currentUser}>
      <div className="flex flex-col lg:flex-row gap-16 py-10 px-4 xl:px-0 max-w-7xl mx-auto">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-3xl lg:ml-12 border-r border-gray-100 pr-0 lg:pr-16">

          {/* Search Bar */}
          <div className="mb-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search stories..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full border-none focus:ring-0 focus:bg-white focus:outline focus:outline-1 focus:outline-gray-300 transition-colors text-sm placeholder:text-gray-500"
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
            <div className="text-center py-20 bg-gray-50 rounded-lg mt-8">
              <p className="text-gray-500 mb-4">No stories found.</p>
              <Link href="/create-post" className="text-black font-medium underline">
                Write the first story
              </Link>
            </div>
          ) : (
            <div className="space-y-0 mt-2">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden lg:block w-80 sticky top-24 h-fit space-y-10">

          {/* Top Posts */}
          <div>
            <h3 className="font-bold text-base mb-6 tracking-wide uppercase text-gray-500 text-xs">Top Picks</h3>
            <div className="space-y-6">
              {topPosts.map((post) => (
                <div key={post._id} className="group cursor-pointer" onClick={() => router.push(`/posts/${post._id}`)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">{post.author?.userName}</span>
                    </div>
                    <h4 className="font-bold text-base leading-snug text-gray-900 group-hover:underline line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2 font-serif">
                      {post.content?.substring(0, 80)}...
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span>{post.likes?.length || 0} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Footer Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <a href="#" className="hover:text-gray-600">Help</a>
            <a href="#" className="hover:text-gray-600">Status</a>
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">About</a>
          </div>
        </div>
      </div>
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