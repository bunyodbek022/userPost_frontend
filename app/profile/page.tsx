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

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ userName: '', age: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostForm, setEditPostForm] = useState({ title: '', content: '' });
  const [isSavingPost, setIsSavingPost] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/posts/my')
      ]);

      const user = userRes.data.data || userRes.data;
      const posts = postsRes.data.data || postsRes.data;

      setUserData(user);
      setMyPosts(Array.isArray(posts) ? posts : []);

      setEditForm({
        userName: user?.userName || '',
        age: user?.age || ''
      });
      setAvatarPreview(user?.avatar || null);
      setAvatarFile(null);

    } catch (err: any) {
      console.error("Profile load error:", err);
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.patch(`/users/${userData._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data || res.data;

      setUserData(updatedUser);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
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
      if (!userData) {
        toast.error("Please log in to repost");
        return;
      }
      await api.post(`/posts/${postId}/repost`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
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
      setIsSavingPost(true);
      await api.patch(`/posts/${editingPost._id}`, editPostForm);
      toast.success("Story updated successfully");
      setEditingPost(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update story");
    } finally {
      setIsSavingPost(false);
    }
  };

  // --- Post Delete ---
  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      toast.success("Story deleted successfully");
      setMyPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete story");
    }
  };

  if (loading) return (
    <MainLayout currentUser={null}>
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout currentUser={userData}>
      <div className="max-w-7xl mx-auto py-10 px-6 xl:px-0 flex flex-col-reverse lg:flex-row justify-center gap-12">

        {/* Left Column: Posts */}
        <div className="w-full max-w-xl lg:ml-auto lg:mr-auto">
          <h2 className="text-4xl font-extrabold font-sans tracking-tight mb-8 hidden lg:block dark:text-[#e0e0e0]">
            {userData?.userName}
          </h2>

          <div className="border-b border-gray-100 dark:border-[#333333] mb-8 pb-1">
            <button className="text-sm font-medium border-b-2 border-black dark:border-white pb-4 -mb-[2px] dark:text-[#e0e0e0]">
              Stories
            </button>
          </div>

          <div className="space-y-2">
            {myPosts.length > 0 ? myPosts.map(post => (
              <PostCard
                key={post._id}
                post={{ ...post, author: userData }}
                currentUser={userData}
                onLike={handleLike}
                onRepost={handleRepost}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 dark:bg-[#1f1f1f] rounded-lg">
                <p className="text-gray-500 dark:text-[#999999] mb-4">You haven't written any stories yet.</p>
                <Link href="/create-post" className="text-black dark:text-white font-medium underline">
                  Write your first story
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Info (Sticky) */}
        <div className="w-full lg:w-80 h-fit lg:sticky lg:top-10">
          <div className="flex flex-col gap-6">
            <Avatar
              src={userData?.avatar}
              fallback={userData?.userName || '?'}
              alt={userData?.userName}
              size="xl"
              className="w-24 h-24 text-4xl"
            />

            <div>
              <h2 className="text-xl font-bold font-sans dark:text-[#e0e0e0]">{userData?.userName}</h2>
              <p className="text-gray-500 dark:text-[#999999] text-sm mt-1">
                {myPosts.length} Stories · {userData?.role === 'admin' ? 'Admin' : 'Writer'}
              </p>
            </div>

            <Button
              variant="substack"
              size="sm"
              className="w-full lg:w-fit font-bold"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit profile
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white dark:bg-[#1f1f1f] shadow-2xl dark:shadow-black/50 rounded-2xl p-8 border border-gray-100 dark:border-[#333333]">
            <h2 className="text-2xl font-bold mb-8 dark:text-[#e0e0e0]">Profile Information</h2>

            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <Avatar
                    src={avatarPreview || undefined}
                    fallback={editForm.userName || '?'}
                    alt="Profile Preview"
                    size="xl"
                    className="w-24 h-24 text-4xl border border-gray-200 dark:border-[#333333] object-cover"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999999] mb-2">Name</label>
                <input
                  type="text"
                  className="w-full border-b border-gray-300 dark:border-[#333333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.userName}
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#999999] mb-2">Age</label>
                <input
                  type="number"
                  className="w-full border-b border-gray-300 dark:border-[#333333] focus:border-black dark:focus:border-white outline-none py-2 text-lg transition bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <Button
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                isLoading={isValidating}
                className="rounded-full px-6"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

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