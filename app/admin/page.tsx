// app/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Bir vaqtning o'zida ikkala ma'lumotni yuklaymiz
      const [userRes, postRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/posts/admin/all`) // Barcha postlar (active/inactive)
      ]);
      setUsers(userRes.data);
      setPosts(postRes.data);
    } catch (err) {
      alert("Admin huquqi yo'q yoki xatolik!");
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  // Rolni o'zgartirish funksiyasi
  const updateRole = async (userId: string, newRole: string) => {
    try {
      await axios.patch(`${API_BASE}/users/${userId}/role`, { role: newRole });
      fetchAdminData(); // Ma'lumotni yangilash
    } catch (err) { alert("Rolni o'zgartirishda xato!"); }
  };

  // Postni aktivlashtirish/o'chirish
  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE}/posts/${postId}/status`, { isActive: !currentStatus });
      fetchAdminData();
    } catch (err) { alert("Post holatini o'zgartirishda xato!"); }
  };

  if (loading) return <div className="text-center mt-20 text-white">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Boshqaruv Paneli</h1>

        {/* 1. Foydalanuvchilar Jadvali */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-purple-700">Foydalanuvchilar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-400">
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-black">{user.userName}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => updateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                        className="text-xs bg-gray-200 hover:bg-gray-300 p-2 rounded-lg font-bold"
                      >
                        Rolni almashtirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Postlarni boshqarish */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-pink-700">Maqolalar (Postlar)</h2>
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post: any) => (
              <div key={post._id} className="flex items-center justify-between border p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-black">{post.title}</h3>
                  <p className="text-sm text-gray-500">Muallif: {post.author?.userName}</p>
                </div>
                <div className="flex items-center gap-4">
                   <span className={post.isActive ? "text-green-500 font-bold" : "text-orange-500 font-bold"}>
                     {post.isActive ? "Aktiv" : "Kutilmoqda"}
                   </span>
                   <button 
                    onClick={() => togglePostStatus(post._id, post.isActive)}
                    className={`px-4 py-2 rounded-lg font-bold text-white ${post.isActive ? 'bg-orange-500' : 'bg-green-500'}`}
                   >
                     {post.isActive ? "Deaktiv qilish" : "Aktiv qilish"}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}