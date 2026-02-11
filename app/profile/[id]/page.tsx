"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { PostCard } from '../../../components/features/PostCard';

export default function UserProfileView() {
  const { id } = useParams();
  const router = useRouter();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Post Modal state (for Admin)
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostForm, setEditPostForm] = useState({ title: '', content: '' });
  const [isSavingPost, setIsSavingPost] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentUserRes, targetUserRes, postsRes] = await Promise.all([
        api.get('/users/profile').catch(() => ({ data: null })), // If not logged in, null
        api.get(`/users/${id}`),
        api.get('/posts', { params: { author: id } })
      ]);

      setCurrentUser(currentUserRes.data?.data || currentUserRes.data);
      setTargetUser(targetUserRes.data?.data || targetUserRes.data);
      setPosts(postsRes.data?.data || postsRes.data || []);

    } catch (err: any) {
      console.error("Profile load error:", err);
      if (err.response?.status === 404) {
        toast.error("User not found");
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  // Actions
  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      // Optimistic update or refetch
      const updatedPosts = posts.map(p => {
        if (p._id === postId) {
          // Toggle logic is complex to replicate exactly without response, so fetching is safer
          // But let's just refetch posts
        }
        return p;
      });
      // Simple way:
      const postRes = await api.get(`/posts`, { params: { author: id } });
      setPosts(postRes.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

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
      setIsSavingPost(true);
      await api.patch(`/posts/${editingPost._id}`, editPostForm);
      toast.success("Story updated successfully");
      setEditingPost(null);
      // Refetch
      const postRes = await api.get('/posts', { params: { author: id } });
      setPosts(postRes.data?.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update story");
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success("Story deleted");
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err: any) {
      toast.error("Failed to delete story");
    }
  };


  if (loading) return (
    <MainLayout currentUser={currentUser}>
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    </MainLayout>
  );

  if (!targetUser) return null;

  return (
    <MainLayout currentUser={currentUser}>
      <div className="max-w-7xl mx-auto py-10 px-6 xl:px-0 flex flex-col-reverse lg:flex-row gap-12">

        {/* Left: Posts */}
        <div className="flex-1 max-w-3xl lg:ml-12">
          <h2 className="text-4xl font-bold font-sans tracking-tight mb-8 hidden lg:block">
            {targetUser.userName}
          </h2>

          <div className="border-b border-gray-100 mb-8 pb-1">
            <span className="text-sm font-medium border-b-2 border-black pb-4 -mb-[2px] inline-block">
              Stories
            </span>
          </div>

          <div className="space-y-2">
            {posts.length > 0 ? posts.map(post => (
              <PostCard
                key={post._id}
                post={{ ...post, author: targetUser }}
                currentUser={currentUser}
                onLike={handleLike}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No stories yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: User Info */}
        <div className="w-full lg:w-80 h-fit lg:sticky lg:top-10">
          <div className="flex flex-col gap-6">
            <Avatar
              src={targetUser?.avatar}
              fallback={targetUser?.userName || '?'}
              alt={targetUser?.userName}
              size="xl"
              className="w-24 h-24 text-4xl"
            />
            <div>
              <h2 className="text-xl font-bold font-sans">{targetUser?.userName}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {posts.length} Stories · {targetUser?.role === 'admin' ? 'Admin' : 'Writer'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Modal (reused) */}
      {editingPost && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Edit Story</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  className="w-full text-2xl font-bold font-serif placeholder:text-gray-300 border-b border-gray-200 focus:border-black outline-none py-3 transition bg-transparent"
                  value={editPostForm.title}
                  onChange={(e) => setEditPostForm({ ...editPostForm, title: e.target.value })}
                  placeholder="Story title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Content</label>
                <textarea
                  className="w-full text-lg font-serif leading-relaxed placeholder:text-gray-300 border border-gray-200 rounded-lg focus:border-black outline-none p-4 transition bg-transparent resize-y min-h-[200px]"
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
                isLoading={isSavingPost}
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