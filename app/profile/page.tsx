"use client";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// API manzili (Feed sahifasidagi bilan bir xil bo'lishi shart)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Edit Modal va Error state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ userName: '', age: '' });
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const router = useRouter();

  // 1. Ma'lumotlarni yuklash (Server URL bilan)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${API_BASE}/users/profile`),
        axios.get(`${API_BASE}/posts/my`)
      ]);
      
      // Ma'lumotlarni olish (NestJS response formatiga moslash)
      const user = userRes.data.data || userRes.data;
      const posts = postsRes.data.data || postsRes.data;

      setUserData(user);
      setMyPosts(Array.isArray(posts) ? posts : []);
      
      // Edit formni to'ldirib qo'yish
      setEditForm({ 
        userName: user?.userName || '', 
        age: user?.age || '' 
      });

    } catch (err) {
      console.error("Yuklashda xato:", err);
      // Agar avtorizatsiya bo'lmasa login'ga otadi
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Real-time Username tekshirish (Faqat o'zgarganda ishlaydi)
  useEffect(() => {
    if (!isEditModalOpen || !editForm.userName || editForm.userName === userData?.userName) {
      setError(null);
      return;
    }

    setIsValidating(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Faqat username bandligini tekshirish uchun alohida endpoint yoki patch sinovi
        await axios.get(`${API_BASE}/users/check-username?username=${editForm.userName}`);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 409) {
          setError("Bu username allaqachon band!");
        }
      } finally {
        setIsValidating(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [editForm.userName, isEditModalOpen, userData?.userName]);

  // 3. Profilni saqlash
  const handleSaveProfile = async () => {
    if (!userData?._id || error) return;
    try {
      const res = await axios.patch(`${API_BASE}/users/${userData._id}`, editForm);
      const updatedUser = res.data.data || res.data;
      
      setUserData(updatedUser);
      setIsEditModalOpen(false);
      alert("Profil muvaffaqiyatli yangilandi!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleLogout = async () => {
    if (!confirm("Chiqmoqchimisiz?")) return;
    try {
      await axios.post(`${API_BASE}/users/logout`);
      router.push('/login');
    } catch { router.push('/login'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse text-2xl font-black italic tracking-tighter">DevStories...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans flex overflow-x-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-black tracking-tighter italic">DevStories</span>
          </div>
          <nav className="flex-1 space-y-6">
            <Link href="/feed" className="flex items-center space-x-4 text-gray-400 hover:text-black font-bold transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span>Home</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-4 text-black font-bold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>Profile</span>
            </Link>
          </nav>
          <button onClick={handleLogout} className="text-left text-gray-400 hover:text-red-500 font-bold text-sm transition tracking-widest uppercase">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-[280px]">
        <header className="p-6 border-b border-gray-50 lg:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-lg">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>

        <main className="max-w-5xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            {/* Left Column */}
            <div className="lg:col-span-8">
              <div className="mb-16">
                 <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">{userData?.userName}</h1>
                 <div className="flex items-center space-x-6 text-sm font-bold border-b border-gray-100 pb-1">
                   <button className="border-b-2 border-black pb-4 -mb-[2px]">Stories</button>
                   <button className="text-gray-300 pb-4 hover:text-black transition">About</button>
                 </div>
              </div>

              <div className="space-y-12">
                {myPosts.length > 0 ? myPosts.map(post => (
                  <article key={post._id} className="group">
                    <Link href={`/posts/${post._id}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <h2 className="text-3xl font-black mb-3 leading-tight group-hover:underline decoration-4 underline-offset-8">
                          {post.title}
                        </h2>
                        <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </Link>
                  </article>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 font-medium">You haven't written any stories yet.</p>
                    <Link href="/create-post" className="text-black font-black underline mt-2 inline-block">Write your first story</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Info Card) */}
            <div className="lg:col-span-4 h-fit sticky top-20">
               <div className="w-32 h-32 rounded-full bg-black text-white flex items-center justify-center text-5xl font-black mb-8 shadow-2xl">
                 {userData?.userName?.charAt(0).toUpperCase()}
               </div>
               
               <div className="space-y-6">
                 <div>
                   <h3 className="font-black text-2xl tracking-tight">{userData?.userName}</h3>
                   <p className="text-gray-400 text-sm font-medium">{userData?.email}</p>
                 </div>

                 <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Age</span>
                      <span className="font-bold">{userData?.age || "Not set"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Account Type</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${userData?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {userData?.role}
                      </span>
                    </div>
                 </div>

                 <button 
                  onClick={() => {
                    setEditForm({ userName: userData.userName, age: userData.age });
                    setIsEditModalOpen(true);
                  }}
                  className="w-full py-4 border-2 border-black rounded-full font-black text-sm hover:bg-black hover:text-white transition-all active:scale-95"
                 >
                   Edit Profile
                 </button>
               </div>
            </div>

          </div>
        </main>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <h2 className="text-5xl font-black mb-12 tracking-tighter">Profile Settings</h2>
            
            <div className="space-y-10">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Display Name</label>
                <input 
                  type="text" 
                  className={`w-full border-b-2 outline-none py-2 text-3xl font-bold transition bg-transparent ${
                    error ? 'border-red-500' : 'border-gray-200 focus:border-black'
                  }`}
                  value={editForm.userName}
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                />
                {isValidating && <div className="absolute right-0 bottom-4 animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>}
                {error && <p className="text-red-500 text-[10px] mt-3 font-black uppercase tracking-widest">{error}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Age</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-2 text-3xl font-bold transition bg-transparent"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4 mt-20">
              <button 
                onClick={handleSaveProfile} 
                disabled={!!error || isValidating}
                className="w-full bg-black text-white font-black py-6 rounded-2xl hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all active:scale-95 shadow-xl"
              >
                SAVE CHANGES
              </button>
              <button 
                onClick={() => { setIsEditModalOpen(false); setError(null); }} 
                className="text-gray-400 font-bold text-sm tracking-widest hover:text-black transition"
              >
                DISCARD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}