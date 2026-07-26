// ... (imports and API setup remains similar)
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import Link from 'next/link';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { PenTool, Download, Bell, ShieldCheck, Trash2, Users, Folder, TrendingUp, Eye, Clock, UserPlus, Heart, Plus, Edit2, X, Check } from 'lucide-react';

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
        api.get('/users'),
        api.get('/categories'),
        api.get('/posts?limit=1000&status=ALL') // Fetch more for stats computation
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
      await api.post('/categories', { name: newCat });
      setNewCat('');
      fetchData();
    } catch (err) { alert("Xato!"); }
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      await api.patch(`/categories/${id}`, { name: editName });
      setEditingCatId(null);
      fetchData();
    } catch (err) { alert("Yangilashda xato!"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Ushbu kategoriyani o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/categories/${id}`);
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
    <>
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="animate-fade-up">
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight mb-2 text-[#16120E] dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] sm:text-xs tracking-wide uppercase">Tizim holati va statistika</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-4 scrollbar-none animate-fade-up [animation-delay:100ms] -mx-4 px-4 md:mx-0 md:px-0">
            <Link href="/admin/analytics/users" className="bg-white dark:bg-[#1E293B] px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm min-w-[110px] transition-transform hover:-translate-y-1 duration-300 group flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 group-hover:text-[#e8440a] transition-colors">
                <Users size={14} />
                <div className="text-[9px] font-black uppercase tracking-[0.2em]">Users</div>
              </div>
              <div className="text-2xl font-black font-serif leading-none tracking-tight">{users.length}</div>
            </Link>
            
            <Link href="/admin/analytics/posts" className="bg-white dark:bg-[#1E293B] px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm min-w-[110px] transition-transform hover:-translate-y-1 duration-300 group flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500 group-hover:text-[#e8440a] transition-colors">
                <Folder size={14} />
                <div className="text-[9px] font-black uppercase tracking-[0.2em]">Posts</div>
              </div>
              <div className="text-2xl font-black font-serif leading-none tracking-tight">{stats.totalPosts}</div>
            </Link>

            <div className="bg-white dark:bg-[#1E293B] px-5 py-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm min-w-[110px] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500">
                <TrendingUp size={14} />
                <div className="text-[9px] font-black uppercase tracking-[0.2em]">Cat</div>
              </div>
              <div className="text-2xl font-black font-serif leading-none tracking-tight">{categories.length}</div>
            </div>
          </div>
        </div>

        {/* MAIN STATS GRID */}
        <div className="animate-fade-up [animation-delay:200ms] bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5">
            <div className="p-8 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-gray-500">
                <Eye size={18} />
                <div className="font-bold text-xs uppercase tracking-wider">Haftalik ko'rishlar</div>
              </div>
              <div className="text-3xl font-black font-serif mb-2 tracking-tight leading-none text-[#16120E] dark:text-white">{stats.totalViews.toLocaleString()}</div>
              <div className="text-[#e8440a] font-bold text-[10px] flex items-center gap-1">
                ↑ 12% bu hafta
              </div>
            </div>
            
            <div className="p-8 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-gray-500">
                <Clock size={18} />
                <div className="font-bold text-xs uppercase tracking-wider">O'rtacha o'qish</div>
              </div>
              <div className="text-3xl font-black font-serif mb-2 tracking-tight leading-none text-[#16120E] dark:text-white">89%</div>
              <div className="text-[#e8440a] font-bold text-[10px] flex items-center gap-1">
                ↑ 3% o'sdi
              </div>
            </div>
            
            <div className="p-8 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-gray-500">
                <UserPlus size={18} />
                <div className="font-bold text-xs uppercase tracking-wider">Yangi userlar</div>
              </div>
              <div className="text-3xl font-black font-serif mb-2 tracking-tight leading-none text-[#16120E] dark:text-white">{stats.newUsers}</div>
              <div className="text-[#e8440a] font-bold text-[10px] flex items-center gap-1">
                ↑ {stats.newUsers > 0 ? 'Haftalik o\'sish' : '0%'}
              </div>
            </div>
            
            <div className="p-8 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-gray-500">
                <Heart size={18} />
                <div className="font-bold text-xs uppercase tracking-wider">Reaksiyalar</div>
              </div>
              <div className="text-3xl font-black font-serif mb-2 tracking-tight leading-none text-[#16120E] dark:text-white">{stats.totalReactions.toLocaleString()}</div>
              <div className="text-[#e8440a] font-bold text-[10px] flex items-center gap-1">
                ↑ 28% o'sdi
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10">

          {/* USERS LIST */}
          <section className="animate-fade-up [animation-delay:300ms] xl:col-span-7 bg-white dark:bg-[#1E293B] rounded-[24px] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <Link href="/admin/analytics/users" className="text-[#e8440a] bg-orange-50 dark:bg-[#e8440a]/10 px-3 py-1.5 rounded-lg font-black text-[9px] tracking-widest uppercase flex items-center gap-2 hover:bg-orange-100 dark:hover:bg-[#e8440a]/20 transition-colors">
                <Eye size={12} strokeWidth={3} /> Barchasini ko'rish
              </Link>
            </div>
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-8">
              <Users size={14} /> System Users
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <div className="col-span-8">Foydalanuvchi</div>
                <div className="col-span-4 text-right">Rol</div>
              </div>

              {users.slice(0, 6).map(user => (
                <div key={user._id} className="grid grid-cols-12 gap-4 items-center group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-8 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-sm ${user.role === 'admin' ? 'bg-[#e8440a]' : 'bg-[#1E293B] dark:bg-gray-700'}`}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#16120E] dark:text-gray-200 group-hover:text-[#e8440a] transition-colors">{user.userName}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px] md:max-w-none">{user.email || 'user@dev.uz'}</div>
                    </div>
                  </div>
                  <div className="col-span-4 text-right">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${user.role === 'admin' ? 'bg-orange-50 dark:bg-[#e8440a]/10 text-[#e8440a]' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                      {user.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-5 space-y-8 md:gap-10">

            {/* QUICK ACTIONS */}
            <section className="animate-fade-up [animation-delay:400ms] bg-white dark:bg-[#1E293B] rounded-[24px] p-8 border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">Tezkor amallar</h3>
              <div className="space-y-3">
                {[
                  { label: 'Yangi maqola yozish', icon: <PenTool size={16} />, active: true, href: '/create-post' },
                  { label: 'Maqolalarni eksport', icon: <Download size={16} />, active: false },
                  { label: 'Barchaga xabarnoma', icon: <Bell size={16} />, active: false },
                  { label: 'Xavfsizlikni tekshirish', icon: <ShieldCheck size={16} />, active: false },
                  { label: 'Cache tozalash', icon: <Trash2 size={16} />, active: false, isDanger: true }
                ].map((action, i) => (
                  action.href ? (
                    <Link href={action.href} key={i} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-[13px] transition-all border border-transparent 
                      ${action.active ? 'bg-[#e8440a] text-white shadow-sm hover:bg-[#d03a08]' : 
                        action.isDanger ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' : 
                        'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                      <span className={action.active ? 'opacity-90' : 'opacity-70'}>{action.icon}</span>
                      {action.label}
                    </Link>
                  ) : (
                    <button key={i} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-[13px] transition-all border border-transparent 
                      ${action.active ? 'bg-[#e8440a] text-white shadow-sm hover:bg-[#d03a08]' : 
                        action.isDanger ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' : 
                        'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                      <span className={action.active ? 'opacity-90' : 'opacity-70'}>{action.icon}</span>
                      {action.label}
                    </button>
                  )
                ))}
              </div>
            </section>

            {/* CATEGORIES MANAGEMENT */}
            <section className="animate-fade-up [animation-delay:500ms] bg-white dark:bg-[#1E293B] rounded-[24px] p-8 border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">Kategoriyalar</h3>
              
              <div className="flex gap-2 mb-6 pointer-events-auto">
                <input 
                  type="text" 
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)}
                  placeholder="Yangi kategoriya..."
                  className="flex-1 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#e8440a]/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#e8440a]/10 outline-none text-[#16120E] dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <button 
                  onClick={handleCreateCategory}
                  disabled={!newCat.trim()}
                  className="bg-[#e8440a] text-white px-5 rounded-xl font-bold text-sm hover:bg-[#d03a08] transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1"
                >
                  <Plus size={16} /> Qo'shish
                </button>
              </div>

              <div className="space-y-1 max-h-[250px] overflow-y-auto scrollbar-hide pr-1">
                {categories.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between group p-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                    {editingCatId === cat._id ? (
                      <div className="flex flex-1 gap-2 mr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-white dark:bg-[#1E293B] border border-[#e8440a]/50 rounded-lg px-3 py-1.5 text-sm outline-none shadow-sm text-gray-900 dark:text-white"
                        />
                        <button onClick={() => handleUpdateCategory(cat._id)} className="text-[#e8440a] p-1.5 rounded-md hover:bg-orange-50 dark:hover:bg-[#e8440a]/10 transition-colors"><Check size={16} /></button>
                        <button onClick={() => setEditingCatId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><X size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-[13px] text-[#16120E] dark:text-gray-200">{cat.name}</div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingCatId(cat._id); setEditName(cat.name); }}
                            className="p-1.5 text-gray-400 hover:text-[#e8440a] hover:bg-orange-50 dark:hover:bg-[#e8440a]/10 rounded-md transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                   <div className="text-center py-8 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Kategoriyalar yo'q</div>
                )}
              </div>
            </section>
          </div>
        </div>
    </>
  );
}