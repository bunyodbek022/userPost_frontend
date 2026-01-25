"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Yangi: Kategoyiyalar state
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Profil va Kategoriyalar va Postlarni bir vaqtda olish
      const [userRes, postsRes, catsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/users/profile`),
        axios.get(`${API_BASE}/posts`),
        axios.get(`${API_BASE}/categories`) // Backenddagi yangi endpoint
      ]);

      if (userRes.status === 'fulfilled') {
        setCurrentUser(userRes.value.data.data || userRes.value.data);
      }

      if (postsRes.status === 'fulfilled') {
        const allPosts = Array.isArray(postsRes.value.data) ? postsRes.value.data : postsRes.value.data.data || [];
        setPosts([...allPosts].reverse());
      }

      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value.data.data || catsRes.value.data);
      }

    } catch (err) {
      console.error("Xato:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Like bosish funksiyasi
  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`);

      const updatedPost = res.data.data || res.data;

      setPosts(prevPosts => {
        return prevPosts.map(p => (p._id === postId ? updatedPost : p));
      });
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

  // Filtrlash logikasi (Kategoriyalar bo'yicha)
  const filteredPosts = selectedTopic === "All"
    ? posts
    : posts.filter(post => post.categories?.some((c: any) => c.name === selectedTopic));

  return (
    <div className="min-h-screen bg-white text-black flex overflow-x-hidden">

      {/* --- SIDEBAR (O'zgarishsiz qoldi) --- */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <span className="text-2xl font-black italic tracking-tighter">DevStories</span>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-4">
            <Link href="/feed" className="flex items-center space-x-4 text-black font-bold p-2 bg-gray-50 rounded-xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              <span className="text-lg">Home</span>
            </Link>

            {currentUser?.role === 'admin' && (
              <Link href="/admin" className="flex items-center space-x-4 text-purple-600 hover:bg-purple-50 p-2 rounded-xl transition font-bold border border-purple-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <span className="text-lg">Dashboard</span>
              </Link>
            )}

            <Link href="/profile" className="flex items-center space-x-4 text-gray-400 hover:text-black hover:bg-gray-50 p-2 rounded-xl transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-lg">Profile</span>
            </Link>
          </nav>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-white ${currentUser?.role === 'admin' ? 'bg-purple-600' : 'bg-black'}`}>
                  {currentUser?.userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black truncate text-black leading-none mb-1">
                    {currentUser?.userName || "Guest"}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentUser?.role === 'admin' ? 'text-purple-600' : 'text-green-600'}`}>
                    {currentUser?.role === 'admin' ? 'Admin' : 'Online'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN SECTION --- */}
      <div className="flex-1 lg:ml-[280px]">
        <header className="py-4 px-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-40 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-2xl font-black italic tracking-tighter">Feed</span>
          </div>

          <Link href="/create-post" className="flex items-center space-x-2 text-gray-500 hover:text-black transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            <span className="text-sm font-medium">Write</span>
          </Link>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Topics bar - Dinamik Kategoriyalar */}
          <div className="flex items-center space-x-6 border-b border-gray-100 mb-10 overflow-x-auto pb-4 scrollbar-hide">
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

          {/* Posts list */}
          <div className="space-y-16">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-3xl w-full"></div>)}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-400">No stories found in this category.</p></div>
            ) : filteredPosts.map(post => {
              const isLiked = post.likes?.some((id: any) =>
                (id._id || id) === (currentUser?._id || currentUser?.id)
              );
              return (
                <article key={post._id} className="group cursor-pointer">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${post.author?.role === 'admin' ? 'bg-purple-600' : 'bg-gray-900'}`}>
                      {post.author?.userName?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="text-xs font-bold text-black">
                      {post.author?.userName || "Anonymous"}
                      {post.author?.role === 'admin' && <span className="ml-1 text-purple-600">✓</span>}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8">
                      <Link href={`/posts/${post._id}`}>
                        <h2 className="text-2xl font-black mb-2 group-hover:underline decoration-2 underline-offset-4">{post.title}</h2>
                        <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed mb-4">{post.content}</p>
                      </Link>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-[11px] font-medium">
                          {post.categories?.map((c: any) => (
                            <span key={c._id} className="bg-gray-100 px-2 py-1 rounded-full text-black italic">#{c.name}</span>
                          ))}
                          <span className="text-gray-400">5 min read</span>
                        </div>

                        {/* LIKE BUTTON */}
                        <button
                          onClick={(e) => handleLike(e, post._id)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${isLiked ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                          <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-xs font-black">{post.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-4 hidden md:block">
                      <div className="w-full h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <svg className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
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