"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); // Qidiruv uchun state
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, postsRes, catsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/users/profile`),
        axios.get(`${API_BASE}/posts`),
        axios.get(`${API_BASE}/categories`)
      ]);

      if (userRes.status === 'fulfilled') {
        setCurrentUser(userRes.value.data.data || userRes.value.data);
      }

      if (postsRes.status === 'fulfilled') {
        const allPosts = Array.isArray(postsRes.value.data) 
          ? postsRes.value.data 
          : postsRes.value.data.data || [];
        setPosts([...allPosts]);
      }

      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value.data.data || catsRes.value.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`);
      const updatedPost = res.data.data || res.data;
      setPosts(prev => prev.map(p => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/users/logout`);
      router.push('/login');
    } catch (err) { router.push('/login'); }
  };

  // --- FILTRLASH LOGIKASI (Kategoriya + Qidiruv) ---
  const filteredPosts = posts.filter(post => {
    const matchesTopic = selectedTopic === "All" || 
      post.categories?.some((c: any) => c.name === selectedTopic);
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title?.toLowerCase().includes(query) || 
      post.content?.toLowerCase().includes(query) ||
      post.author?.userName?.toLowerCase().includes(query);

    return matchesTopic && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-black flex overflow-x-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <span className="text-2xl font-black italic tracking-tighter">DevStories</span>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            <Link href="/feed" className="flex items-center space-x-4 text-black font-bold p-3 bg-gray-50 rounded-2xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              <span>Home</span>
            </Link>
            
            {currentUser?.role === 'admin' && (
              <Link href="/admin" className="flex items-center space-x-4 text-purple-600 hover:bg-purple-50 p-3 rounded-2xl transition font-bold border border-purple-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <span>Dashboard</span>
              </Link>
            )}

            <Link href="/profile" className="flex items-center space-x-4 text-gray-500 hover:text-black hover:bg-gray-50 p-3 rounded-2xl transition font-medium">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span>Profile</span>
            </Link>
          </nav>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${currentUser?.role === 'admin' ? 'bg-purple-600' : 'bg-black'}`}>
                  {currentUser?.userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold truncate">{currentUser?.userName || "Guest"}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentUser?.role === 'admin' ? 'text-purple-600' : 'text-green-600'}`}>
                    {currentUser?.role === 'admin' ? 'Admin' : 'Online'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN SECTION */}
      <div className="flex-1 lg:ml-[280px]">
        {/* HEADER WITH SEARCH */}
        <header className="py-4 px-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              
              {/* SEARCH BAR */}
              <div className="relative w-full max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border-none rounded-2xl text-sm focus:ring-0 focus:bg-gray-100 transition-all outline-none"
                />
              </div>
            </div>

            <Link href="/create-post" className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-2xl hover:bg-gray-800 transition shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 4v16m8-8H4" /></svg>
              <span className="text-sm font-bold hidden sm:inline">Write</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* TOPICS BAR */}
          <div className="flex items-center space-x-6 border-b border-gray-100 mb-10 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setSelectedTopic("All")}
              className={`text-sm whitespace-nowrap pb-2 transition-all ${selectedTopic === "All" ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-black'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setSelectedTopic(cat.name)}
                className={`text-sm whitespace-nowrap pb-2 transition-all ${selectedTopic === cat.name ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-black'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* POSTS LIST */}
          <div className="space-y-12">
            {loading ? (
              <div className="space-y-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3"><div className="w-6 h-6 bg-gray-100 rounded-full"></div><div className="w-24 h-3 bg-gray-100 rounded"></div></div>
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-12 bg-gray-50 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed">
                <p className="text-gray-400 font-medium">No stories found. Try a different search or topic.</p>
              </div>
            ) : filteredPosts.map(post => {
              const isLiked = post.likes?.some((id: any) =>
                (id._id || id) === (currentUser?._id || currentUser?.id)
              );
              return (
                <article key={post._id} className="group">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${post.author?.role === 'admin' ? 'bg-purple-600' : 'bg-black'}`}>
                      {post.author?.userName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold">
                      {post.author?.userName} {post.author?.role === 'admin' && <span className="text-purple-600 ml-0.5">✓</span>}
                    </span>
                    <span className="text-gray-300 text-xs">•</span>
                    <span className="text-gray-400 text-[10px] font-medium uppercase tracking-tighter">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-8">
                      <Link href={`/posts/${post._id}`}>
                        <h2 className="text-xl md:text-2xl font-black mb-3 leading-tight group-hover:text-gray-700 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-gray-500 line-clamp-2 text-sm md:text-base leading-relaxed mb-6">
                          {post.content}
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {post.categories?.map((c: any) => (
                            <span key={c._id} className="bg-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight text-gray-600 italic">
                              #{c.name}
                            </span>
                          ))}
                          <span className="text-gray-400 text-[11px] ml-2 hidden sm:block">5 min read</span>
                        </div>

                        <button
                          onClick={(e) => handleLike(e, post._id)}
                          className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl transition-all ${isLiked ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                          <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-xs font-black">{post.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-4 hidden md:block">
                      <div className="aspect-[4/3] bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 group-hover:bg-gray-100 transition-colors">
                         <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
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