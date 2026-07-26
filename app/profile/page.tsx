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
import { MoreVertical, Edit2 } from 'lucide-react';

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    userName: '', 
    birthDate: '', 
    profession: '', 
    techStacks: [] as string[] 
  });
  const [professions, setProfessions] = useState<any[]>([]);
  const [techStacksList, setTechStacksList] = useState<any[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, postsRes, profRes, tsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/posts/my'),
        api.get('/professions').catch(() => ({ data: [] })),
        api.get('/tech-stacks').catch(() => ({ data: [] })),
      ]);

      const user = userRes.data.data || userRes.data;
      const posts = postsRes.data.data || postsRes.data;

      setProfessions(profRes.data || []);
      setTechStacksList(tsRes.data || []);

      setUserData(user);
      setMyPosts(Array.isArray(posts) ? posts : []);

      setEditForm({
        userName: user?.userName || '',
        birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        profession: user?.profession?._id || user?.profession || '',
        techStacks: user?.techStacks?.map((ts: any) => ts._id || ts) || [],
      });
      setAvatarPreview(user?.avatar || null);
      setAvatarFile(null);
      setCoverImagePreview(user?.coverImage || null);
      setCoverImageFile(null);

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

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      // Optionally automatically save when they select a cover image?
      // Or they have to click 'Edit profile' to save? Let's just update the backend immediately for cover image.
      handleCoverImageUpload(file);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    if (!userData?._id) return;
    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      const res = await api.patch(`/users/${userData._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data || res.data;
      setUserData(updatedUser);
      toast.success('Cover image updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update cover image');
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?._id) return;
    try {
      setIsValidating(true);
      const formData = new FormData();
      formData.append('userName', editForm.userName);
      if (editForm.birthDate) formData.append('birthDate', editForm.birthDate);
      if (editForm.profession) formData.append('profession', editForm.profession);
      editForm.techStacks.forEach((ts, index) => {
        formData.append(`techStacks[${index}]`, ts);
      });
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverImageFile) formData.append('coverImage', coverImageFile);

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

        {/* ── Modern Profile Header with Banner ── */}
        <div className="mb-10">
          {/* Banner */}
          <div 
            className="h-40 sm:h-48 w-full rounded-2xl mt-4 relative overflow-hidden border border-gray-50 dark:border-white/5 bg-gradient-to-tr from-brand-orange/10 via-orange-200/40 to-brand-orange/5 dark:from-brand-orange/10 dark:via-[#1e1e1e] dark:to-[#121212] bg-cover bg-center"
            style={(coverImagePreview || userData?.coverImage) ? { 
              backgroundImage: `url(${(coverImagePreview || userData?.coverImage).startsWith('/uploads') 
                ? ((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + (coverImagePreview || userData?.coverImage)) 
                : (coverImagePreview || userData?.coverImage)})` 
            } : {}}
          >
            {/* Edit Cover Button */}
            <div className="absolute top-4 right-4">
              <label className="cursor-pointer bg-black/40 hover:bg-black/60 text-white backdrop-blur-md p-2 rounded-full transition-colors flex items-center justify-center">
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="px-4 sm:px-8 flex flex-col relative z-10 -mt-16">
            <div className="flex items-start mb-3 w-full">
              <Avatar
                src={userData?.avatar}
                fallback={userData?.userName || '?'}
                alt={userData?.userName}
                size="xl"
                className="w-32 h-32 text-5xl ring-4 ring-white dark:ring-[#0B1120] bg-white dark:bg-[#0B1120] shrink-0"
              />
              
              <div className="flex-1 flex justify-center pt-[85px]">
                <div className="hidden sm:flex items-center gap-10 text-gray-600 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <span className="text-black dark:text-white font-bold text-2xl">{myPosts.length}</span>
                    <span className="text-[14px] font-medium">Stories</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-black dark:text-white font-bold text-2xl">{following.length}</span>
                    <span className="text-[14px] font-medium">Subscriptions</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-black dark:text-white font-bold text-2xl">{userData?.followers?.length ?? 0}</span>
                    <span className="text-[14px] font-medium">Followers</span>
                  </div>
                </div>
              </div>
              
              {/* Menu Button (Top Right of white area) */}
              <div className="relative pt-[85px] shrink-0">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1E293B] text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <MoreVertical size={24} />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-[112px] w-48 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-100 dark:border-[#333] overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#2A3B52] transition-colors dark:text-white"
                    >
                      <Edit2 size={16} />
                      Edit profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Stats (visible only on small screens) */}
            <div className="flex sm:hidden items-center gap-6 text-gray-600 dark:text-gray-400 mb-4 mt-2">
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-bold text-lg">{myPosts.length}</span>
                <span className="text-xs font-medium">Stories</span>
              </div>
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-bold text-lg">{following.length}</span>
                <span className="text-xs font-medium">Subscriptions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-bold text-lg">{userData?.followers?.length ?? 0}</span>
                <span className="text-xs font-medium">Followers</span>
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl font-bold font-sans dark:text-white mb-1">
                {userData?.userName}
              </h1>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-2">
                {userData?.role === 'admin' ? 'Staff Admin' : 'Writer'}
                {userData?.profession && (
                  <>
                    <span className="mx-2">&bull;</span>
                    {userData.profession.name || professions.find(p => p._id === userData.profession)?.name}
                  </>
                )}
              </p>

              {userData?.techStacks?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {userData.techStacks.map((ts: any) => (
                    <span key={ts._id || ts} className="px-2.5 py-0.5 bg-gray-100 dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                      {ts.name || techStacksList.find(t => t._id === ts)?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-100 dark:border-[#2a2a2a] mb-8">
          <div className="flex gap-8 px-2 sm:px-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${activeTab === tab.key
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-[#888] hover:text-gray-800 dark:hover:text-[#aaa]'
                  }`}
              >
                {tab.label} {tab.count > 0 && <span className="ml-1 opacity-60">({tab.count})</span>}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-t-full" />
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
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1E293B] rounded-xl">
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
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#555] transition-all"
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
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1E293B] rounded-xl">
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
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1E293B] rounded-xl">
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
          <div className="max-w-lg w-full bg-white dark:bg-[#1E293B] shadow-2xl dark:shadow-black/50 rounded-2xl p-8 border border-gray-100 dark:border-[#333]">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">Birth Date (Optional)</label>
                <input
                  type="date"
                  className="w-full border-b border-gray-300 dark:border-[#333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">Profession</label>
                <select
                  className="w-full border-b border-gray-300 dark:border-[#333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.profession}
                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                >
                  <option value="" className="dark:bg-[#1E293B]">Select Profession</option>
                  {professions.map(p => (
                    <option key={p._id} value={p._id} className="dark:bg-[#1E293B]">{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">Tech Stacks</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 dark:border-[#333] rounded-xl">
                  {techStacksList.map(ts => {
                    const isSelected = editForm.techStacks.includes(ts._id);
                    return (
                      <button
                        key={ts._id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditForm({ ...editForm, techStacks: editForm.techStacks.filter(id => id !== ts._id) });
                          } else {
                            setEditForm({ ...editForm, techStacks: [...editForm.techStacks, ts._id] });
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isSelected 
                            ? 'bg-brand-orange text-white' 
                            : 'bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#444]'
                        }`}
                      >
                        {ts.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-10">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button variant="substack" onClick={handleSaveProfile} isLoading={isValidating} className="rounded-full px-6">
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