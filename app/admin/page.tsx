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
        const profileRes = await axios.get(`${API_BASE}/users/profile`);
        const userData = profileRes.data.data || profileRes.data;

        if (userData.role !== 'admin') {
          alert("Siz admin emassiz!");
          router.push('/feed');
          return;
        }
        await loadAllData();
      } catch (err) {
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
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/posts`)
      ]);
      setUsers(uRes.data.data || uRes.data);
      setPosts(pRes.data.data || pRes.data);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato");
    }
  };

  // --- ROLNI O'ZGARTIRISH (PATCH /api/users/{id}) ---
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Foydalanuvchini ${newRole.toUpperCase()} qilmoqchimisiz?`)) return;

    try {
      await axios.patch(`${API_BASE}/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Rolni o'zgartirib bo'lmadi!");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) { alert("Xatolik!"); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Postni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/posts/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) { alert("Xatolik!"); }
  };

  if (loading) return <div className="flex justify-center mt-20 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 md:p-12 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-black">CONTROL <span className="text-purple-600">CENTER</span></h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">DevStories Administration Tool</p>
          </div>
          <Link href="/feed" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all text-sm">
            BACK TO FEED
          </Link>
        </div>

        <div className="flex gap-4 mb-10">
          <button onClick={() => setActiveTab('users')} className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-200 scale-105' : 'bg-gray-100 text-gray-400 hover:text-black'}`}>Users List</button>
          <button onClick={() => setActiveTab('posts')} className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-black text-white shadow-2xl shadow-gray-200 scale-105' : 'bg-gray-100 text-gray-400 hover:text-black'}`}>Articles</button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-50 p-4">
          {activeTab === 'users' ? (
            <table className="w-full">
              <thead>
                <tr className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-8 text-left">Identity</th>
                  <th className="p-8 text-left">Privileges</th>
                  <th className="p-8 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-white'}`}>
                          {u.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-lg text-black">{u.userName}</p>
                          <p className="text-sm text-gray-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-100' : 'bg-gray-50 text-gray-400 ring-1 ring-gray-100'}`}>
                        {u.role === 'admin' ? '✦ Administrator' : 'Standard User'}
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleUserRole(u._id, u.role)}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.role === 'admin' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)} className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                          Ban User
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 space-y-4">
              {posts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-gray-100 text-gray-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-black mb-1 group-hover:text-purple-600 transition-colors">{p.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Author:</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black underline underline-offset-4">{p.author?.userName || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePost(p._id)} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}