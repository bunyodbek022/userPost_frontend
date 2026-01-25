"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bunyodbek.me/api';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    age: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | string[]>(''); // Xatoliklar uchun
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataToSend = {
      ...formData,
      age: Number(formData.age)
    };

    try {
      // Backend: POST /users/register
      await axios.post(`${API_BASE}/users/register`, dataToSend);
      
      router.push('/login');
    } catch (err: any) {
      // Backenddan kelayotgan massiv shaklidagi yoki oddiy xatolarni ushlash
      const errorMessage = err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi";
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
          <p className="text-gray-500 mt-2 font-medium">Yangi akkount yaratish</p>
        </div>

        {/* Xatoliklarni ko'rsatish */}
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

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Username</label>
            <input 
              required
              name="userName"
              value={formData.userName} // Controlled component
              type="text" 
              placeholder="bunyodbek" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1">Yosh</label>
              <input 
                required
                name="age"
                value={formData.age}
                type="number" 
                placeholder="25" 
                className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
              <input 
                required
                name="email"
                value={formData.email}
                type="email" 
                placeholder="info@dev.uz" 
                className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Maxfiy parol</label>
            <input 
              required
              name="password"
              value={formData.password}
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none transition-all text-black"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-500/40 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Akkountingiz bormi? 
          <Link href="/login" className="ml-1 font-bold text-purple-600 hover:text-purple-800 transition">
            Tizimga kiring
          </Link>
        </p>
      </div>
    </div>
  );
}