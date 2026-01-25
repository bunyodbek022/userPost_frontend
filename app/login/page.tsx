"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// API URL ni aniqlash
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';

// Backend bilan sessiyani cookie orqali boshqarish
axios.defaults.withCredentials = true;

export default function Login() {
  // MUHIM: Backend userName (N katta) kutgani uchun state kalitini ham shunga moslaymiz
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[]>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend: POST /users/login
      const response = await axios.post(`${API_BASE}/users/login`, formData);
      
      if (response.data.success) {
        router.push('/feed'); 
      }
    } catch (err: any) {
      // Backenddan kelayotgan Validation xatolarini (Array bo'lsa) chiroyli ko'rsatish
      const errorMessage = err.response?.data?.message || "Tizimga kirishda xatolik yuz berdi";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 font-sans">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 italic tracking-tighter">
            DevStories
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Xush kelibsiz! Davom etish uchun kiring.</p>
        </div>

        {/* Xatolik xabarlarini ko'rsatish qismi */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
            {Array.isArray(error) ? (
              <ul className="list-disc ml-4">
                {error.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Foydalanuvchi nomi</label>
            <input 
              required
              type="text"
              name="userName"
              placeholder="bunyodbek" 
              className="w-full p-4 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
              // userName (N katta) ekanligiga e'tibor bering
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Maxfiy parol</label>
            <input 
              required
              minLength={6}
              type="password" 
              name="password"
              placeholder="••••••••" 
              className="w-full p-4 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/40 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                Kirilmoqda...
              </span>
            ) : "Tizimga kirish"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600 text-sm">
            Akkountingiz yo'qmi? 
            <Link href="/register" className="ml-1 font-bold text-purple-600 hover:text-purple-800 transition">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}