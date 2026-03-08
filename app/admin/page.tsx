// ... (imports and API setup remains similar)
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

const API_BASE = '/api';
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    newUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const [newCat, setNewCat] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, cRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/posts?limit=1000&status=ALL`) // Fetch more for stats computation
      ]);

      const usersData = uRes.data.data || uRes.data || [];
      const categoriesData = cRes.data.data || cRes.data || [];
      const postsData = pRes.data.data || [];
      const postsPagination = pRes.data.pagination || { total: postsData.length };

      setUsers(usersData);
      setCategories(categoriesData);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Compute Weekly Stats
      let weeklyViews = 0;
      let weeklyReactions = 0;

      postsData.forEach((post: any) => {
        const postDate = new Date(post.createdAt);
        if (postDate >= oneWeekAgo) {
          weeklyViews += (post.views || 0);
          // Reactions = likes + dislikes
          weeklyReactions += (post.likes?.length || 0) + (post.dislikes?.length || 0);
        }
      });

      const weeklyNewUsers = usersData.filter((u: any) => {
        const created = new Date(u.createdAt);
        return created >= oneWeekAgo;
      }).length;

      setStats({
        totalPosts: postsPagination.total,
        totalViews: weeklyViews,
        totalReactions: weeklyReactions,
        newUsers: weeklyNewUsers
      });

    } catch (err) {
      console.error("Ma'lumot yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--warm-paper)]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="text-2xl font-serif font-black italic tracking-tighter text-[#e8440a]">DevStories</div>
        <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#e8440a] animate-[ruleGrow_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--warm-paper)] flex font-sans text-[var(--ink-black)] selection:bg-[#e8440a]/10">

      {/* DESKTOP SIDEBAR */}
      <AdminSidebar className="w-[280px] hidden lg:flex sticky top-0 h-screen" />

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-[280px] h-full animate-in slide-in-from-left duration-500" onClick={e => e.stopPropagation()}>
            <AdminSidebar className="h-full" onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 xl:p-12 overflow-y-auto">

        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="animate-fade-up">
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight mb-2">Dashboard</h1>
            <p className="text-gray-400 font-bold text-[10px] sm:text-xs tracking-wide">Tizim holati va statistika</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-4 scrollbar-none animate-fade-up [animation-delay:100ms] -mx-4 px-4 md:mx-0 md:px-0">
            <Link href="/admin/users" className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm min-w-[100px] transition-transform hover:-translate-y-1 duration-300 group">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 group-hover:text-[#e8440a] transition-colors">Users</div>
              <div className="text-xl font-black font-serif leading-none tracking-tight">{users.length}</div>
            </Link>
            {[
              { label: 'Posts', value: stats.totalPosts },
              { label: 'Cat', value: categories.length }
            ].map((stat, i) => (
              <div key={i} className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm min-w-[100px] transition-transform hover:-translate-y-1 duration-300">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                <div className="text-xl font-black font-serif leading-none tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN STATS GRID */}
        <div className="animate-fade-up [animation-delay:200ms] bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-50 group hover:bg-gray-50/30 transition-colors">
              <div className="text-3xl font-black font-serif mb-1 tracking-tight leading-none">{stats.totalViews.toLocaleString()}</div>
              <div className="text-gray-400 font-bold text-xs mb-3">Haftalik ko'rishlar</div>
              <div className="text-green-500 font-black text-[10px] flex items-center gap-1">
                ↑ 12% bu hafta
              </div>
            </div>
            <div className="p-8 md:p-10 group hover:bg-gray-50/30 transition-colors">
              <div className="text-3xl font-black font-serif mb-1 tracking-tight leading-none">89%</div>
              <div className="text-gray-400 font-bold text-xs mb-3">O'rtacha o'qish</div>
              <div className="text-green-500 font-black text-[10px] flex items-center gap-1">
                ↑ 3% o'sdi
              </div>
            </div>
            <div className="p-8 md:p-10 border-t border-gray-50 md:border-r group hover:bg-gray-50/30 transition-colors">
              <div className="text-3xl font-black font-serif mb-1 tracking-tight leading-none">{stats.newUsers}</div>
              <div className="text-gray-400 font-bold text-xs mb-3">Haftalik yangi userlar</div>
              <div className="text-green-500 font-black text-[10px] flex items-center gap-1">
                ↑ {stats.newUsers > 0 ? 'Haftalik o\'sish' : '0%'}
              </div>
            </div>
            <div className="p-8 md:p-10 border-t border-gray-50 group hover:bg-gray-50/30 transition-colors">
              <div className="text-3xl font-black font-serif mb-1 tracking-tight leading-none">{stats.totalReactions.toLocaleString()}</div>
              <div className="text-gray-400 font-bold text-xs mb-3">Haftalik reaksiyalar</div>
              <div className="text-green-500 font-black text-[10px] flex items-center gap-1">
                ↑ 28% o'sdi
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10">

          {/* USERS LIST */}
          <section className="animate-fade-up [animation-delay:300ms] xl:col-span-7 bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <button className="text-[#e8440a] font-black text-[9px] tracking-widest uppercase flex items-center gap-2 hover:opacity-70 transition-opacity">
                + Qo'shish
              </button>
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8">System Users</h3>

            <div className="space-y-5">
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-300">
                <div className="col-span-8">Foydalanuvchi</div>
                <div className="col-span-4 text-right">Rol</div>
              </div>

              {users.slice(0, 6).map(user => (
                <div key={user._id} className="grid grid-cols-12 gap-4 items-center group cursor-pointer">
                  <div className="col-span-8 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md ${user.role === 'admin' ? 'bg-[#e8440a] shadow-[#e8440a]/10' : 'bg-[#e8440a]/80 shadow-orange-500/10'
                      }`}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm group-hover:text-[#e8440a] transition-colors">{user.userName}</div>
                      <div className="text-[11px] text-gray-400 font-medium truncate max-w-[120px] md:max-w-none">{user.email || 'user@dev.uz'}</div>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${user.role === 'admin' ? 'bg-orange-50 text-[#e8440a]' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {user.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-5 space-y-8 md:gap-10">

            {/* QUICK ACTIONS - Now taking more prominence */}
            <section className="animate-fade-up [animation-delay:400ms] bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
              <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8">Tezkor amallar</h3>
              <div className="space-y-4">
                {[
                  { label: 'Yangi maqola yozish', icon: '✍️', color: 'bg-orange-50 text-[#e8440a]', href: '/feed' },
                  { label: 'Maqolalarni eksport qilish', icon: '📥', color: 'bg-gray-50 text-[#16120E]' },
                  { label: 'Barcha foydalanuvchilarga xabar', icon: '🔔', color: 'bg-gray-50 text-[#16120E]' },
                  { label: 'Tizim xavfsizligini tekshirish', icon: '🛡️', color: 'bg-orange-50 text-[#e8440a]' },
                  { label: 'Cache tozalash', icon: '🗑️', color: 'bg-red-50 text-[#e8440a]' }
                ].map((action, i) => (
                  <button key={i} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] border border-transparent hover:border-gray-100 ${action.color}`}>
                    <span className="text-xl">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* MOBILE TRIGGER */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed bottom-8 right-8 lg:hidden w-14 h-14 rounded-full bg-[#0A0908] text-white flex items-center justify-center shadow-xl z-40 transition-transform active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>

      </main>
    </div>
  );
}