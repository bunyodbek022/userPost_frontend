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
import { FollowButton } from '../../../components/ui/FollowButton';
import { EditPostModal } from '../../../components/features/EditPostModal';

type Tab = 'stories' | 'subscriptions' | 'followers';

export default function UserProfileView() {
  const { id } = useParams();
  const router = useRouter();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('stories');

  // Edit Post Modal state (for Admin/Owner)
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentUserRes, targetUserRes, postsRes] = await Promise.all([
        api.get('/users/profile').catch(() => ({ data: null })),
        api.get(`/users/${id}`),
        api.get('/posts', { params: { author: id } }),
      ]);

      setCurrentUser(currentUserRes.data?.data || currentUserRes.data);
      const user = targetUserRes.data?.data || targetUserRes.data;
      setTargetUser(user);
      setPosts(postsRes.data?.data || postsRes.data || []);

      // Fetch following and followers lists
      const [followingRes, followersRes] = await Promise.all([
        api.get(`/users/${id}/following`),
        api.get(`/users/${id}/followers`),
      ]);
      setFollowing(followingRes.data?.data || []);
      setFollowers(followersRes.data?.data || []);

    } catch (err: any) {
      console.error('Profile load error:', err);
      if (err.response?.status === 404) {
        toast.error('User not found');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      const postRes = await api.get('/posts', { params: { author: id } });
      setPosts(postRes.data?.data || postRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      if (!currentUser) { toast.error('Please log in to repost'); return; }
      await api.post(`/posts/${postId}/repost`);
      const postRes = await api.get('/posts', { params: { author: id } });
      setPosts(postRes.data?.data || postRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
  };

  const handleSavePost = async (data: { title: string; content: string }) => {
    if (!editingPost?._id) return;
    try {
      setIsSavingPost(true);
      await api.patch(`/posts/${editingPost._id}`, data);
      toast.success('Story updated successfully');
      setEditingPost(null);
      const postRes = await api.get('/posts', { params: { author: id } });
      setPosts(postRes.data?.data || postRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update story');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Story deleted');
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch {
      toast.error('Failed to delete story');
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'stories', label: 'Stories', count: posts.length },
    { key: 'subscriptions', label: 'Subscriptions', count: following.length },
    { key: 'followers', label: 'Followers', count: followers.length },
  ];

  const refreshLists = async () => {
    const [followingRes, followersRes, targetRes] = await Promise.all([
      api.get(`/users/${id}/following`),
      api.get(`/users/${id}/followers`),
      api.get(`/users/${id}`),
    ]);
    setFollowing(followingRes.data?.data || []);
    setFollowers(followersRes.data?.data || []);
    setTargetUser(targetRes.data?.data || targetRes.data);
  };

  return (
    <MainLayout currentUser={currentUser}>
      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── Instagram-style Header ── */}
        <div className="flex flex-col items-center pt-10 pb-6">
          {/* Avatar */}
          <div className="mb-4">
            <Avatar
              src={targetUser?.avatar}
              fallback={targetUser?.userName || '?'}
              alt={targetUser?.userName}
              size="xl"
              className="w-24 h-24 text-4xl ring-2 ring-gray-200 dark:ring-[#333] ring-offset-2 ring-offset-white dark:ring-offset-[#121212]"
            />
          </div>

          {/* Username */}
          <h1 className="text-2xl font-bold font-sans dark:text-[#e0e0e0] mb-1">
            {targetUser?.userName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#888] mb-4">
            {targetUser?.role === 'admin' ? '🛡 Admin' : 'Writer'}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{posts.length}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Stories</p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-[#333]" />
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{following.length}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Subscriptions</p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-[#333]" />
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{followers.length}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Followers</p>
            </div>
          </div>

          {/* Follow / Unfollow Button */}
          <FollowButton
            targetUserId={String(targetUser._id)}
            currentUser={currentUser}
            size="md"
            onToggle={refreshLists}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 dark:border-[#333] mb-6">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.key
                  ? 'text-black dark:text-white'
                  : 'text-gray-400 dark:text-[#666] hover:text-gray-700 dark:hover:text-[#aaa]'
                  }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-[#666]">({tab.count})</span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}

        {/* STORIES TAB */}
        {activeTab === 'stories' && (
          <div className="space-y-2">
            {posts.length > 0 ? posts.map(post => (
              <PostCard
                key={post._id}
                post={{ ...post, author: targetUser }}
                currentUser={currentUser}
                onLike={handleLike}
                onRepost={handleRepost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999]">No stories yet.</p>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div>
            {following.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {following.map((user: any) => (
                  <Link
                    key={user._id}
                    href={`/profile/${user._id}`}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#555] transition-all"
                  >
                    <Avatar
                      src={user.avatar}
                      fallback={user.userName || '?'}
                      alt={user.userName}
                      size="sm"
                      className="w-11 h-11 text-lg flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm dark:text-[#e0e0e0] truncate">{user.userName}</p>
                      <p className="text-xs text-gray-400 dark:text-[#666]">
                        {user.role === 'admin' ? 'Admin' : 'Writer'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999]">
                  {targetUser.userName} hasn't subscribed to anyone yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOLLOWERS TAB */}
        {activeTab === 'followers' && (
          <div>
            {followers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {followers.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#555] transition-all"
                  >
                    <Link href={`/profile/${user._id}`} className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={user.avatar}
                        fallback={user.userName || '?'}
                        alt={user.userName}
                        size="sm"
                        className="w-11 h-11 text-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm dark:text-[#e0e0e0] truncate">{user.userName}</p>
                        <p className="text-xs text-gray-400 dark:text-[#666]">
                          {user.role === 'admin' ? 'Admin' : 'Writer'}
                        </p>
                      </div>
                    </Link>
                    <div className="ml-3 flex-shrink-0">
                      <FollowButton
                        targetUserId={String(user._id)}
                        currentUser={currentUser}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999]">
                  {targetUser.userName} has no followers yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePost}
          isLoading={isSavingPost}
        />
      )}
    </MainLayout>
  );
}