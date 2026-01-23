"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Base URL ni .env fayldan olamiz, agar u bo'lmasa default production manzilni ishlatamiz
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';

axios.defaults.withCredentials = true;

const TOPICS = ["All", "Programming", "Technology", "Design", "AI", "Startup", "Career"];

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Sidebar uchun tizimga kirgan foydalanuvchi ma'lumoti
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Tizimga kirgan foydalanuvchi profilini olish
      try {
        const userRes = await axios.get(`${API_BASE}/users/profile`);
        // NestJS response formatiga qarab (data.data yoki data)
        const userData = userRes.data.data || userRes.data;
        setCurrentUser(userData);
      } catch (userErr) {
        console.warn("Profil yuklashda xato (ehtimol login qilinmagan):", userErr);
      }

      // 2. Barcha postlarni olish
      const postsRes = await axios.get(`${API_BASE}/posts`);
      const allPosts = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.data || [];
      const reversedPosts = [...allPosts].reverse();
      
      setPosts(reversedPosts);
      setFilteredPosts(reversedPosts);
    } catch (err) {
      console.error("Ma'lumot yuklashda umumiy xato:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrlash logikasi
  useEffect(() => {
    if (selectedTopic === "All") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title?.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        post.content?.toLowerCase().includes(selectedTopic.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [selectedTopic, posts]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/users/logout`);
      router.push('/login');
    } catch (err) {
      console.error("Logout xatosi:", err);
      router.push('/login'); 
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex overflow-x-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-gray-50">
            <span className="text-2xl font-black italic tracking-tighter">DevStories</span>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-6">
            <Link href="/feed" className="flex items-center space-x-4 text-black font-bold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span className="text-lg">Home</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-4 text-gray-400 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span className="text-lg">Profile</span>
            </Link>
            <Link href="/feed" className="flex items-center space-x-4 text-gray-400 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span className="text-lg">Stories</span>
            </Link>
          </nav>

          {/* SIDEBAR FOOTER (User info) */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-black text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                  {currentUser?.userName?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black truncate text-black leading-none mb-1">
                    {currentUser?.userName || "Guest"}
                  </span>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="text-2xl font-black italic tracking-tighter">DevStories</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/create-post" className="flex items-center space-x-2 text-gray-500 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              <span className="text-sm font-medium">Write</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold ring-2 ring-gray-50">
               {currentUser?.userName?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Topics bar */}
          <div className="flex items-center space-x-6 border-b border-gray-100 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            {TOPICS.map(topic => (
              <button 
                key={topic} 
                onClick={() => setSelectedTopic(topic)}
                className={`text-sm whitespace-nowrap pb-2 transition-all ${selectedTopic === topic ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-black'}`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Posts list */}
          <div className="space-y-16">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-3xl w-full"></div>)}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                 <p className="text-gray-400">No stories found for this topic.</p>
              </div>
            ) : filteredPosts.map(post => (
              <article key={post._id} className="group cursor-pointer">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {post.author?.userName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <span className="text-xs font-bold text-black">{post.author?.userName || "Anonymous"}</span>
                </div>
                
                <Link href={`/posts/${post._id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <h2 className="text-2xl font-black mb-2 group-hover:underline decoration-2 underline-offset-4">{post.title}</h2>
                    <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed mb-4">
                      {post.content || "Fascinating story. Explore the latest insights and developments in this deep dive..."}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-medium">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-black">Technology</span>
                      <span>5 min read</span>
                    </div>
                  </div>
                  <div className="md:col-span-4 hidden md:block">
                    <div className="w-full h-32 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <svg className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}