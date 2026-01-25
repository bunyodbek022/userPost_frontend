"use client";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Kategoriya uchun state-lar
  const [newCat, setNewCat] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/categories`)
      ]);
      setUsers(uRes.data.data || uRes.data || []);
      setCategories(cRes.data.data || cRes.data || []);
    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- KATEGORIYA AMALLARI ---
  const handleCreateCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await axios.post(`${API_BASE}/categories`, { name: newCat });
      setNewCat('');
      fetchData();
    } catch (err) { alert("Xato!"); }
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      await axios.patch(`${API_BASE}/categories/${id}`, { name: editName });
      setEditingCatId(null);
      fetchData();
    } catch (err) { alert("Yangilashda xato!"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Ushbu kategoriyani o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      fetchData();
    } catch (err) { alert("O'chirishda xato!"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-bounce text-2xl font-black italic tracking-tighter">Admin Panel Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-black text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="mb-12">
          <span className="text-2xl font-black tracking-tighter italic">DevStories</span>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-2">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 bg-white/10 p-4 rounded-2xl font-bold">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span>Overview</span>
          </Link>
          <Link href="/feed" className="flex items-center space-x-3 text-gray-400 p-4 rounded-2xl hover:bg-white/5 transition font-bold">
             <span>Site View</span>
          </Link>
        </nav>
        <div className="pt-8 border-t border-white/10">
          <Link href="/profile" className="text-sm font-bold text-gray-500 hover:text-white transition underline underline-offset-4">My Profile</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-black">Dashboard</h1>
            <p className="text-gray-400 font-medium mt-2">Xush kelibsiz, Admin. Tizim to'liq nazorat ostida.</p>
          </div>
          <div className="hidden sm:flex space-x-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[120px]">
                <p className="text-[10px] font-black text-gray-400 uppercase">Users</p>
                <p className="text-2xl font-black">{users.length}</p>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[120px]">
                <p className="text-[10px] font-black text-gray-400 uppercase">Categories</p>
                <p className="text-2xl font-black">{categories.length}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* 1. USERS LIST - 7/12 width */}
          <section className="xl:col-span-7 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">System Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-300">
                    <th className="pb-4">Username</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="group hover:bg-gray-50/50 transition">
                      <td className="py-5">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">
                             {user.userName?.charAt(0).toUpperCase()}
                           </div>
                           <span className="font-bold text-gray-800">{user.userName}</span>
                        </div>
                      </td>
                      <td className="py-5">
                         <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                           {user.role}
                         </span>
                      </td>
                      <td className="py-5 text-right">
                        <Link href={`/profile/${user._id}`} className="bg-black text-white text-[10px] font-black px-4 py-2 rounded-full hover:bg-gray-800 transition">
                          VIEW PROFILE
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. CATEGORIES MANAGEMENT - 5/12 width */}
          <section className="xl:col-span-5 space-y-8">
            
            {/* Create Category Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Create Category</h3>
              <div className="flex space-x-3">
                <input 
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 ring-black transition"
                  placeholder="Category name..."
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                />
                <button 
                  onClick={handleCreateCategory}
                  className="bg-black text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-800 transition shadow-lg shadow-black/10"
                >
                  ADD
                </button>
              </div>
            </div>

            {/* List Category Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Manage Categories</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition group">
                    {editingCatId === cat._id ? (
                      <div className="flex flex-1 space-x-2">
                        <input 
                          className="flex-1 bg-white rounded-lg px-2 py-1 font-bold outline-none border-2 border-black"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateCategory(cat._id)} className="text-green-600 font-black text-[10px]">SAVE</button>
                        <button onClick={() => setEditingCatId(null)} className="text-gray-400 font-black text-[10px]">CANCEL</button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-gray-800">{cat.name}</span>
                        <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => {setEditingCatId(cat._id); setEditName(cat.name)}} className="text-blue-500 font-black text-[10px] hover:underline">EDIT</button>
                          <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-400 font-black text-[10px] hover:underline">DELETE</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}