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
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'categories'>('users');
  const router = useRouter();

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const profileRes = await axios.get(`${API_BASE}/users/profile`);
        const user = profileRes.data.data || profileRes.data;
        if (user.role !== 'admin') {
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
      const [uRes, pRes, cRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/posts/admin/all`), // Barcha postlar (active/inactive)
        axios.get(`${API_BASE}/categories`)
      ]);
      setUsers(uRes.data.data || uRes.data);
      setPosts(pRes.data.data || pRes.data);
      setCategories(cRes.data.data || cRes.data);
    } catch (err) { console.error("Ma'lumot yuklashda xato"); }
  };

  // --- USER ACTIONS ---
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await axios.patch(`${API_BASE}/users/${userId}`, { role: newRole });
    loadAllData();
  };

  const deleteUser = async (id: string) => {
    if (confirm("Foydalanuvchini o'chirmoqchimisiz?")) {
      await axios.delete(`${API_BASE}/users/${id}`);
      loadAllData();
    }
  };

  // --- POST ACTIONS ---
  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    await axios.patch(`${API_BASE}/posts/${postId}/status`, { isActive: !currentStatus });
    loadAllData();
  };

  const deletePost = async (id: string) => {
    if (confirm("Postni o'chirmoqchimisiz?")) {
      await axios.delete(`${API_BASE}/posts/${id}`);
      loadAllData();
    }
  };

  // --- CATEGORY ACTIONS ---
  const createCategory = async () => {
    if (!newCat) return;
    await axios.post(`${API_BASE}/categories`, { name: newCat });
    setNewCat("");
    loadAllData();
  };

  if (loading) return <div className="p-10 text-center font-black">YUKLANMOQDA...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-black font-sans p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter">ADMIN <span className="text-purple-600">PRO</span></h1>
            <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-[0.3em]">Management Console</p>
          </div>
          <Link href="/feed" className="bg-black text-white px-10 py-4 rounded-full font-black text-xs hover:scale-105 transition-all">FEEDGA QAYTISH</Link>
        </header>

        {/* Tab switcher */}
        <div className="flex gap-4 mb-8">
          {['users', 'posts', 'categories'].map((tab: any) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-white text-gray-400 hover:text-black'}`}>
              {tab} ({tab === 'users' ? users.length : tab === 'posts' ? posts.length : categories.length})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          {/* USERS TABLE */}
          {activeTab === 'users' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="p-8">User</th>
                  <th className="p-8">Role</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black">{u.userName?.charAt(0)}</div>
                        <div><p className="font-black text-lg">{u.userName}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span>
                    </td>
                    <td className="p-8 text-right space-x-2">
                      <button onClick={() => toggleUserRole(u._id, u.role)} className="text-[10px] font-black uppercase underline">Role</button>
                      <button onClick={() => deleteUser(u._id)} className="text-[10px] font-black uppercase text-red-500 underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* POSTS MANAGEMENT */}
          {activeTab === 'posts' && (
            <div className="p-8 space-y-4">
              {posts.map(p => (
                <div key={p._id} className="flex justify-between items-center bg-gray-50 p-6 rounded-[2rem] border border-transparent hover:border-purple-100 transition">
                  <div>
                    <h3 className="font-black text-xl">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Muallif: <span className="text-black font-bold">{p.author?.userName}</span></p>
                    <div className="flex gap-2 mt-3">
                      {p.categories?.map((c: any) => (
                        <span key={c._id} className="text-[9px] font-black bg-white px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tighter">#{c.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => togglePostStatus(p._id, p.isActive)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {p.isActive ? 'Active' : 'Pending'}
                    </button>
                    <button onClick={() => deletePost(p._id)} className="bg-red-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="p-8">
              <div className="flex gap-4 mb-10">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Yangi kategoriya nomi..." />
                <button onClick={createCategory} className="bg-black text-white px-10 rounded-2xl font-black text-xs">ADD CATEGORY</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(c => (
                  <div key={c._id} className="bg-gray-50 p-6 rounded-[1.5rem] flex justify-between items-center group hover:bg-purple-600 transition-all">
                    <span className="font-black text-sm group-hover:text-white uppercase tracking-widest">{c.name}</span>
                    <button onClick={async () => { await axios.delete(`${API_BASE}/categories/${c._id}`); loadAllData(); }} className="text-gray-300 group-hover:text-white/50 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}