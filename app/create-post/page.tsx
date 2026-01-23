"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

axios.defaults.withCredentials = true;

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    if (!title || !content) {
      alert("Iltimos, sarlavha va matnni to'ldiring!");
      return;
    }

    setLoading(true);
    try {
      // Swagger: POST /posts
       const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await axios.post(`${API_URL}/posts`, { title, content });
      router.push('/feed'); // Chop etilgach Feed'ga qaytish
    } catch (err) {
      alert("Postni chop etishda xatolik yuz berdi. Tizimga kirganingizni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-serif">
      {/* Upper Bar */}
      <nav className="max-w-5xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-4">
          <Link href="/feed" className="text-2xl font-black tracking-tighter">D.</Link>
          <span className="text-sm text-gray-400 font-sans italic">Draft in {title || "Untitled"}</span>
        </div>
        
        <div className="flex items-center space-x-4 font-sans">
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="bg-[#1a8917] hover:bg-[#156d12] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
          <button className="text-gray-500 hover:text-black transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
          </button>
        </div>
      </nav>

      {/* Writing Area */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center mb-10 group">
            <div className="w-12 h-12 border-l-2 border-gray-100 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                <svg className="w-8 h-8 text-gray-200 group-hover:text-gray-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4"/></svg>
            </div>
            
            {/* Title Input */}
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

        {/* Content Input */}
        <textarea 
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xl md:text-2xl border-none outline-none placeholder:text-gray-200 resize-none min-h-[500px] leading-relaxed text-black font-sans"
        />
      </main>

      {/* Floating Toolbar (Creative Element) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-gray-100 rounded-full px-6 py-3 flex items-center space-x-6 animate-bounce-slow">
         <button title="Add Image" className="text-gray-400 hover:text-indigo-600 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
         <button title="Add Code" className="text-gray-400 hover:text-indigo-600 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg></button>
         <button title="Formatting" className="text-gray-400 hover:text-indigo-600 transition font-bold font-serif text-xl italic">Tt</button>
      </div>
    </div>
  );
}