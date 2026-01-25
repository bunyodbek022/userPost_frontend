"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

// 1. Asosiy Kontent Komponenti
function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State-lar
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // URL parametrlarini o'qish
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  // Ma'lumotlarni yuklash funksiyasi
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // API URL yasash
      let postsUrl = `${API_BASE}/posts?limit=50`;
      
      // Agar kategoriya tanlangan bo'lsa, uning ID-sini topamiz
      if (currentCategory !== 'All' && categories.length > 0) {
        const catObj = categories.find(c => c.name === currentCategory);
        if (catObj) postsUrl += `&category=${catObj._id}`;
      }
      
      if (currentSearch) {
        postsUrl += `&search=${encodeURIComponent(currentSearch)}`;
      }

      // Parallel so'rovlar
      const [userRes, postsRes, catsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/users/profile`),
        axios.get(postsUrl),
        axios.get(`${API_BASE}/categories`)
      ]);

      if (userRes.status === 'fulfilled') {
        setCurrentUser(userRes.value.data.data || userRes.value.data);
      }
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value.data.data || catsRes.value.data);
      }
      if (postsRes.status === 'fulfilled') {
        const data = postsRes.value.data.data || postsRes.value.data || [];
        setPosts(data);
      }
    } catch (err) {
      console.error("Feed yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, categories]);

  // Faqat birinchi marta va kategoriya o'zgarganda ishlaydi
  useEffect(() => {
    loadData();
  }, [currentCategory, currentSearch, categories.length]);

  const updateFilters = (category: string, search: string) => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    router.push(`/feed?${params.toString()}`);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`);
      const updatedPost = res.data.data || res.data;
      setPosts(prev => prev.map(p => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Like xatosi", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/users/logout`);
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex overflow-x-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-black italic tracking-tighter">DevStories</span>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">✕</button>
          </div>

          <nav className="flex-1 space-y-2">
            <Link href="/feed" className="flex items-center space-x-4 text-black font-bold p-3 bg-gray-50 rounded-2xl">
               <span className="text-xl">🏠</span> <span>Home</span>
            </Link>
            {currentUser?.role === 'admin' && (
              <Link href="/admin" className="flex items-center space-x-4 text-purple-600 p-3 rounded-2xl hover:bg-purple-50 transition font-bold border border-purple-100">
                <span>📊</span> <span>Dashboard</span>
              </Link>
            )}
            <Link href="/profile" className="flex items-center space-x-4 text-gray-500 hover:text-black p-3 rounded-2xl transition font-medium">
               <span>👤</span> <span>Profile</span>
            </Link>
          </nav>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">
                {currentUser?.userName?.charAt(0).toUpperCase() || "G"}
              </div>
              <div className="truncate text-left">
                <p className="text-sm font-bold truncate">{currentUser?.userName || "Guest"}</p>
                <p className="text-[10px] text-green-600 font-black uppercase">Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">🚪</button>
          </div>
        </div>
      </aside>

      {/* MAIN SECTION */}
      <div className="flex-1 lg:ml-[280px]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-2xl">☰</button>
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search stories..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl outline-none focus:ring-2 ring-black transition"
                value={currentSearch}
                onChange={(e) => updateFilters(currentCategory, e.target.value)}
              />
            </div>
            <Link href="/create-post" className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-800 transition">
              WRITE
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-8 border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
            {['All', ...categories.map(c => c.name)].map(catName => (
              <button
                key={catName}
                onClick={() => updateFilters(catName, currentSearch)}
                className={`pb-4 text-sm font-bold transition-all whitespace-nowrap ${currentCategory === catName ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                {catName}
              </button>
            ))}
          </div>

          <div className="space-y-16">
            {loading ? (
              <div className="space-y-10 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-[32px]" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-bold italic">No stories found.</div>
            ) : posts.map(post => {
                const isLiked = post.likes?.some((id: any) => (id._id || id) === currentUser?._id);
                return (
                  <article key={post._id} className="group">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold italic">
                        {post.author?.userName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-black">{post.author?.userName}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400 text-[10px] font-bold uppercase">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-12 gap-8">
                      <div className="md:col-span-8">
                        <Link href={`/posts/${post._id}`}>
                          <h2 className="text-2xl font-black mb-3 leading-tight group-hover:underline">{post.title}</h2>
                          <p className="text-gray-500 line-clamp-3 leading-relaxed mb-6">{post.content}</p>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {post.categories?.map((c: any) => (
                              <span key={c._id} className="bg-gray-100 text-[10px] font-black uppercase px-3 py-1 rounded-full text-gray-500 italic">
                                #{c.name}
                              </span>
                            ))}
                          </div>
                          <button 
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition ${isLiked ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:bg-gray-50'}`}
                          >
                            <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                            <span className="text-xs font-black">{post.likes?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-4 hidden md:block">
                        <div className="aspect-square bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center text-4xl">🖼️</div>
                      </div>
                    </div>
                  </article>
                );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

// 2. Final Export (Build-xatosini oldini olish uchun Suspense)
export default function Feed() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black italic">Loading DevStories...</div>}>
      <FeedContent />
    </Suspense>
  );
}