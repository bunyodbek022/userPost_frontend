"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const router = useRouter();

  useEffect(() => {
    const initAdmin = async () => {
      try {
        // 1. Avval admin ekanligingizni tekshirish
        const profileRes = await axios.get(`${API_BASE}/users/profile`);
        const userData = profileRes.data.data || profileRes.data;

        if (userData.role !== 'admin') {
          alert("Siz admin emassiz! Feedga qaytarilasiz.");
          router.push('/feed');
          return;
        }

        // 2. Ma'lumotlarni yuklash
        await loadAllData();
      } catch (err) {
        console.error("Admin tekshiruvida xato:", err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initAdmin();
  }, []);

  const loadAllData = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/users`), //
        axios.get(`${API_BASE}/posts`)  //
      ]);
      setUsers(uRes.data.data || uRes.data);
      setPosts(pRes.data.data || pRes.data);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Foydalanuvchini butunlay o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`); //
      setUsers(users.filter(u => u._id !== id));
    } catch (err) { alert("O'chirishda xatolik!"); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Ushbu maqolani o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/posts/${id}`); //
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) { alert("Postni o'chirishda xatolik!"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-solid"></div>
        <p className="text-gray-500 font-medium">Admin panel yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-10 font-sans text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic text-purple-700">ADMIN DASHBOARD</h1>
            <p className="text-gray-500 font-medium mt-1">DevStories boshqaruv markazi</p>
          </div>
          <Link href="/feed" className="bg-white border-2 border-gray-100 px-6 py-3 rounded-2xl font-bold hover:border-purple-200 transition-all flex items-center gap-2 w-fit">
            ← Feedga qaytish
          </Link>
        </div>

        {/* Stats & Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button 
            onClick={() => setActiveTab('users')}
            className={`p-6 rounded-3xl text-left transition-all border-2 ${activeTab === 'users' ? 'bg-white border-purple-600 shadow-xl shadow-purple-100' : 'bg-white border-transparent hover:border-gray-200'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Jami foydalanuvchilar</p>
                <h2 className="text-4xl font-black">{users.length}</h2>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">👤</div>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('posts')}
            className={`p-6 rounded-3xl text-left transition-all border-2 ${activeTab === 'posts' ? 'bg-white border-pink-600 shadow-xl shadow-pink-100' : 'bg-white border-transparent hover:border-gray-200'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Jami maqolalar</p>
                <h2 className="text-4xl font-black">{posts.length}</h2>
              </div>
              <div className="bg-pink-50 p-4 rounded-2xl text-pink-600">📝</div>
            </div>
          </button>
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-[2rem] border-2 border-gray-50 overflow-hidden shadow-sm">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-6">Foydalanuvchi</th>
                    <th className="p-6">Rol / Holat</th>
                    <th className="p-6 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                            {u.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{u.userName}</p>
                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 gap-4">
              {posts.map((p) => (
                <div key={p._id} className="group flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-pink-100 hover:bg-white transition-all">
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex w-16 h-16 bg-white rounded-2xl items-center justify-center border border-gray-100 text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg group-hover:text-pink-600 transition-colors">{p.title}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">Muallif: <span className="text-black">{p.author?.userName || 'Anonymous'}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeletePost(p._id)}
                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
              {posts.length === 0 && <p className="text-center py-10 text-gray-400 font-medium">Hali maqolalar yozilmagan.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}