"use client";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

  // 1. Ma'lumotlarni yuklash
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        axios.get('http://localhost:3000/users/profile'),
        axios.get('http://localhost:3000/posts/my')
      ]);
      
      if (userRes.data.success) setUserData(userRes.data.data);
      if (postsRes.data.success) setMyPosts(postsRes.data.data);
    } catch (err) {
      console.error("Yuklashda xato:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Real-time Username tekshirish (Debounce)
  useEffect(() => {
    if (!isEditModalOpen || !editForm.userName || editForm.userName === userData?.userName) {
      setError(null);
      return;
    }

    setIsValidating(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        await axios.patch(`http://localhost:3000/users/${userData._id}`, { 
        userName: editForm.userName 
      });
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 409) setError("Bu username allaqachon band!");
      } finally {
        setIsValidating(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [editForm.userName, isEditModalOpen, userData?.userName]);

  // 3. Profilni saqlash (PATCH method)
  const handleSaveProfile = async () => {
    if (!userData?._id || error) return;
    try {
      const res = await axios.patch(`http://localhost:3000/users/${userData._id}`, editForm);
      if (res.data) {
        setUserData(res.data.data || res.data);
        setIsEditModalOpen(false);
        alert("Profil yangilandi!");
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleLogout = async () => {
    if (!confirm("Chiqmoqchimisiz?")) return;
    try {
      await axios.post('http://localhost:3000/users/logout');
      router.push('/login');
    } catch { router.push('/login'); }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex overflow-x-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-gray-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-10">
            <span className="text-2xl font-black tracking-tighter italic">DevStories</span>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <nav className="flex-1 space-y-7">
            <Link href="/feed" className="flex items-center space-x-4 text-gray-500 hover:text-black font-medium transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>Home</span></Link>
            <Link href="/profile" className="flex items-center space-x-4 text-black font-bold"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg><span>Profile</span></Link>
          </nav>
          <button onClick={handleLogout} className="text-left text-red-500 font-bold mb-4">Logout</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 lg:ml-[280px]">
        <header className="p-4 border-b border-gray-50 lg:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40">
          <button onClick={() => setIsSidebarOpen(true)}><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Chap taraf */}
            <div className="lg:col-span-8">
              <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tight">{userData?.userName || "..."}</h1>
              <div className="flex items-center space-x-8 border-b border-gray-100 mb-12">
                 <button className="text-sm font-bold border-b-2 border-black pb-4">Home</button>
                 <button className="text-sm font-medium text-gray-400 pb-4 hover:text-black transition">About</button>
              </div>

              <div className="space-y-10 mb-20">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">My Stories</h3>
                {myPosts.length > 0 ? myPosts.map(post => (
                  <article key={post._id} className="border-b border-gray-50 pb-8 group">
                    <Link href={`/posts/${post._id}`}>
                      <h2 className="text-2xl font-black group-hover:text-gray-600 transition">{post.title}</h2>
                    </Link>
                  </article>
                )) : <p className="text-gray-400 italic">No stories published yet.</p>}
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative group">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">Reading list</h2>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z"/></svg>
                </div>
                <p className="text-gray-500 text-sm">No stories saved.</p>
              </div>
            </div>

            {/* O'ng taraf */}
            <div className="lg:col-span-4 space-y-8 sticky top-24 h-fit">
               <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl font-bold mb-6">
                 {userData?.userName?.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h3 className="font-black text-xl">{userData?.userName}</h3>
                 <p className="text-gray-500 text-sm mb-6">{userData?.email}</p>
                 <div className="space-y-3 py-6 border-t border-gray-100">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Age</span><span className="font-bold">{userData?.age}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Role</span><span className="font-bold capitalize">{userData?.role}</span></div>
                 </div>
                 <button onClick={() => { setEditForm({ userName: userData.userName, age: userData.age }); setIsEditModalOpen(true); }} className="mt-4 text-green-600 font-bold text-sm hover:underline">Edit profile</button>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- EDIT MODAL (REAL-TIME VALIDATION) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8">
            <h2 className="text-4xl font-black mb-10 tracking-tighter text-center">Profile Settings</h2>
            
            <div className="space-y-8">
              {/* Username Input */}
              <div className="relative flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Username</label>
                <input 
                  type="text" 
                  className={`border-b-2 outline-none py-3 text-2xl font-bold transition bg-transparent ${
                    error ? 'border-red-500 text-red-500' : 'border-gray-200 focus:border-black'
                  }`}
                  value={editForm.userName}
                  onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                />
                {isValidating && <span className="absolute right-0 bottom-4 animate-spin text-gray-400">...</span>}
                {!error && !isValidating && editForm.userName !== userData?.userName && editForm.userName.length > 2 && (
                  <span className="absolute right-0 bottom-4 text-green-500 text-xs font-bold">✓ Available</span>
                )}
                {error && <span className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider animate-pulse">{error}</span>}
              </div>

              {/* Age Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Age</label>
                <input 
                  type="number" 
                  className="border-b-2 border-gray-200 focus:border-black outline-none py-3 text-2xl font-bold transition bg-transparent"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4 mt-16">
              <button 
                onClick={handleSaveProfile} 
                disabled={!!error || isValidating}
                className="w-full bg-black text-white font-black py-5 rounded-full hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                SAVE CHANGES
              </button>
              <button onClick={() => { setIsEditModalOpen(false); setError(null); }} className="w-full text-gray-400 font-bold py-2 hover:text-black transition">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}