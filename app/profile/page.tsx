"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { MainLayout } from '../../components/layout/MainLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PostCard } from '../../components/features/PostCard';
import { FollowButton } from '../../components/ui/FollowButton';
import { EditPostModal } from '../../components/features/EditPostModal';

type Tab = 'stories' | 'subscriptions' | 'liked';

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('stories');

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ userName: '', age: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/posts/my'),
      ]);

      const user = userRes.data.data || userRes.data;
      const posts = postsRes.data.data || postsRes.data;

      setUserData(user);
      setMyPosts(Array.isArray(posts) ? posts : []);

      setEditForm({
        userName: user?.userName || '',
        age: user?.age || '',
      });
      setAvatarPreview(user?.avatar || null);
      setAvatarFile(null);

      // Fetch following list and liked posts
      if (user?._id) {
        const [followingRes, likedRes] = await Promise.all([
          api.get(`/users/${user._id}/following`),
          api.get('/posts', { params: { likedBy: user._id } }).catch(() => ({ data: { data: [] } })),
        ]);
        setFollowing(followingRes.data?.data || []);
        // Filter from all posts for liked: use a direct filter from my posts liked array
        // Since there's no dedicated endpoint, fetch all posts and filter client-side
        // We'll use a separate distinct approach
      }

    } catch (err: any) {
      console.error('Profile load error:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch liked posts separately once we have user  
  const fetchLikedPosts = useCallback(async (userId: string) => {
    try {
      // Fetch recent posts and filter ones where userId is in likes array
      const res = await api.get('/posts', { params: { limit: 50 } });
      const allPosts: any[] = res.data?.data || res.data || [];
      const liked = allPosts.filter((p: any) =>
        Array.isArray(p.likes) && p.likes.some((id: any) => String(id) === String(userId))
      );
      setLikedPosts(liked);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (userData?._id) {
      api.get(`/users/${userData._id}/following`).then(res => {
        setFollowing(res.data?.data || []);
      }).catch(() => { });
      fetchLikedPosts(userData._id);
    }
  }, [userData?._id, fetchLikedPosts]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?._id) return;
    try {
      setIsValidating(true);
      const formData = new FormData();
      formData.append('userName', editForm.userName);
      formData.append('age', editForm.age);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.patch(`/users/${userData._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data || res.data;
      setUserData(updatedUser);
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsValidating(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      if (!userData) { toast.error('Please log in to repost'); return; }
      await api.post(`/posts/${postId}/repost`);
      fetchData();
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
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update story');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Story deleted successfully');
      setMyPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete story');
    }
  };

  if (loading) return (
    <MainLayout currentUser={null}>
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    </MainLayout>
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'stories', label: 'Stories', count: myPosts.length },
    { key: 'subscriptions', label: 'Subscriptions', count: following.length },
    { key: 'liked', label: 'Liked', count: likedPosts.length },
  ];

  return (
    <MainLayout currentUser={userData}>
      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── Instagram-style Header ── */}
        <div className="flex flex-col items-center pt-10 pb-6">
          {/* Avatar */}
          <div className="relative group cursor-pointer mb-4">
            <Avatar
              src={userData?.avatar}
              fallback={userData?.userName || '?'}
              alt={userData?.userName}
              size="xl"
              className="w-24 h-24 text-4xl ring-2 ring-gray-200 dark:ring-[#333] ring-offset-2 ring-offset-white dark:ring-offset-[#121212]"
            />
          </div>

          {/* Username */}
          <h1 className="text-2xl font-bold font-sans dark:text-[#e0e0e0] mb-1">
            {userData?.userName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#888] mb-4">
            {userData?.role === 'admin' ? '🛡 Admin' : 'Writer'}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{myPosts.length}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Stories</p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-[#333]" />
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{following.length}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Subscriptions</p>
            </div>
            <div className="w-px h-8 bg-gray-200 dark:bg-[#333]" />
            <div className="text-center">
              <p className="text-lg font-bold dark:text-[#e0e0e0]">{userData?.followers?.length ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-[#888] uppercase tracking-wide">Followers</p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Button
            variant="substack"
            size="sm"
            className="px-8 font-semibold rounded-full"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit profile
          </Button>
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
            {myPosts.length > 0 ? myPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={userData}
                onLike={handleLike}
                onRepost={handleRepost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999999] mb-4">You haven't written any stories yet.</p>
                <Link href="/create-post" className="text-black dark:text-white font-medium underline">
                  Write your first story
                </Link>
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
                        currentUser={userData}
                        size="sm"
                        onToggle={() => {
                          // Refresh following list
                          if (userData?._id) {
                            api.get(`/users/${userData._id}/following`).then(res => {
                              setFollowing(res.data?.data || []);
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999] mb-2">You haven't subscribed to anyone yet.</p>
                <p className="text-sm text-gray-400 dark:text-[#666]">
                  Explore stories and follow writers you like.
                </p>
              </div>
            )}
          </div>
        )}

        {/* LIKED TAB */}
        {activeTab === 'liked' && (
          <div className="space-y-2">
            {likedPosts.length > 0 ? likedPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={userData}
                onLike={handleLike}
                onRepost={handleRepost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-xl">
                <p className="text-gray-500 dark:text-[#999] mb-2">No liked stories yet.</p>
                <p className="text-sm text-gray-400 dark:text-[#666]">
                  Stories you like will appear here.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white dark:bg-[#1f1f1f] shadow-2xl dark:shadow-black/50 rounded-2xl p-8 border border-gray-100 dark:border-[#333]">
            <h2 className="text-2xl font-bold mb-8 dark:text-[#e0e0e0]">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <Avatar
                    src={avatarPreview || undefined}
                    fallback={editForm.userName || '?'}
                    alt="Profile Preview"
                    size="xl"
                    className="w-24 h-24 text-4xl border border-gray-200 dark:border-[#333] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="avatar-upload" className="cursor-pointer text-white text-xs font-medium">
                      Change
                    </label>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">Name</label>
                <input
                  type="text"
                  className="w-full border-b border-gray-300 dark:border-[#333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.userName}
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">Age</label>
                <input
                  type="number"
                  className="w-full border-b border-gray-300 dark:border-[#333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-10">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} isLoading={isValidating} className="rounded-full px-6">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

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