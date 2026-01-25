"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';
axios.defaults.withCredentials = true;

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Kategoriya uchun state-lar
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const router = useRouter();

  // 1. Backenddan barcha kategoriyalarni olish
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        setAvailableCategories(res.data.data || res.data);
      } catch (err) {
        console.error("Kategoriyalarni yuklashda xato");
      }
    };
    fetchCats();
  }, []);

  // Kategoriya tanlash/o'chirish logikasi
  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!title || !content) {
      alert("Iltimos, sarlavha va matnni to'ldiring!");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Kamida bitta kategoriya tanlang!");
      setShowCategoryModal(true); // Modalni ochish
      return;
    }

    setLoading(true);
    try {
      // Swagger: POST /posts 
      // Endi 'categories' ID massivini ham yuboramiz
      await axios.post(`${API_BASE}/posts`, { 
        title, 
        content, 
        categories: selectedCategories 
      });
      router.push('/feed');
    } catch (err) {
      alert("Xatolik! Tizimga kirganingizni va kategoriyalar tanlanganini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-serif">
      {/* Upper Bar */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center py-4 px-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-4">
          <Link href="/feed" className="text-2xl font-black tracking-tighter">D.</Link>
          <span className="text-sm text-gray-400 font-sans italic truncate max-w-[150px]">
            Draft in {title || "Untitled"}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 font-sans">
          {/* Kategoriya tanlash tugmasi */}
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="text-sm font-medium text-purple-600 border border-purple-100 px-4 py-1.5 rounded-full hover:bg-purple-50 transition"
          >
            {selectedCategories.length > 0 ? `${selectedCategories.length} Tags selected` : "Add Tags"}
          </button>

          <button 
            onClick={handlePublish}
            disabled={loading}
            className="bg-[#1a8917] hover:bg-[#156d12] text-white px-5 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </nav>

      {/* Writing Area */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-start mb-10 group">
            <div className="mt-3 w-10 h-10 border-l border-gray-100 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4"/></svg>
            </div>
            
            <textarea 
              placeholder="Title"
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold border-none outline-none placeholder:text-gray-200 resize-none ml-6 overflow-hidden leading-tight text-black"
              onInput={(e: any) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
        </div>

        <textarea 
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xl md:text-2xl border-none outline-none placeholder:text-gray-100 resize-none min-h-[500px] leading-relaxed text-black font-sans"
        />
      </main>

      {/* --- CATEGORY SELECT MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-2 tracking-tight">Add topics</h2>
            <p className="text-gray-400 text-sm mb-8 font-sans">
              Story'ngiz qaysi mavzularga oid? Kamida bittasini tanlang.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-10 font-sans">
              {availableCategories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => toggleCategory(cat._id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                    selectedCategories.includes(cat._id)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowCategoryModal(false)}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all"
            >
              DONE ({selectedCategories.length})
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-gray-100 rounded-full px-6 py-3 flex items-center space-x-6 z-40">
         <button title="Formatting" className="text-gray-400 hover:text-black transition font-bold font-serif text-xl italic">Tt</button>
         <button title="Add Image" className="text-gray-400 hover:text-black transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
         <button onClick={() => setShowCategoryModal(true)} title="Add Categories" className={`transition ${selectedCategories.length > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
         </button>
      </div>
    </div>
  );
}