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

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ userName: '', age: '' });
  const [isValidating, setIsValidating] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!userData?._id) return;
    try {
      setIsValidating(true);
      const res = await api.patch(`/users/${userData._id}`, editForm);
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
    // Optimistic update or refetch
    // For profile posts, simpler to just accept it works or refetch
    try {
      await api.post(`/posts/${postId}/like`);
      fetchData(); // Refresh to see updated likes
    } catch (error) {
      console.error(error);
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
      <div className="max-w-7xl mx-auto py-10 px-6 xl:px-0 flex flex-col-reverse lg:flex-row gap-12">

        {/* Left Column: Posts */}
        <div className="flex-1 max-w-3xl lg:ml-12">
          <h2 className="text-4xl font-bold font-sans tracking-tight mb-8 hidden lg:block">
            {userData?.userName}
          </h2>

          <div className="border-b border-gray-100 mb-8 pb-1">
            <button className="text-sm font-medium border-b-2 border-black pb-4 -mb-[2px]">
              Stories
            </button>
          </div>

          <div className="space-y-2">
            {myPosts.length > 0 ? myPosts.map(post => (
              <PostCard
                key={post._id}
                post={{ ...post, author: userData }} // Ensure author info is present
                currentUser={userData}
                onLike={handleLike}
              />
            )) : (
              <div className="py-20 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">You haven't written any stories yet.</p>
                <Link href="/create-post" className="text-black font-medium underline">
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
              <h2 className="text-xl font-bold font-sans">{userData?.userName}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {myPosts.length} Stories · {userData?.role === 'admin' ? 'Admin' : 'Writer'}
              </p>
            </div>

            <Button
              variant="ghost"
              className="text-green-700 text-sm justify-start px-0 hover:bg-transparent hover:text-green-800"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit profile
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-8">Profile Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-lg transition bg-transparent"
                  value={editForm.userName}
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  className="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-lg transition bg-transparent"
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
    </MainLayout>
  );
}