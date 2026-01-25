"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    age: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Barcha inputlar uchun umumiy handle funksiyasi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Oddiy validatsiya
    if (formData.password.length < 6) {
      return alert("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
    }

    setLoading(true);

    const dataToSend = {
      ...formData,
      age: Number(formData.age)
    };

    try {
      // API manzili environment variable'dan olinishi tavsiya etiladi
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await axios.post(`${API_URL}/users/register`, dataToSend);
      
      alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || "Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Xush kelibsiz!
          </h2>
          <p className="text-gray-500 mt-2">O'z blogingizni yaratish uchun ro'yxatdan o'ting</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Username</label>
            <input 
              required
              name="userName"
              type="text" 
              placeholder="Masalan: johndoe" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Yoshingiz</label>
            <input 
              required
              name="age"
              type="number" 
              placeholder="Masalan: 25" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Email manzili</label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="john@example.com" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Maxfiy parol</label>
            <input 
              required
              name="password"
              type="password" 
              placeholder="Kamida 6 ta belgi" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Yuborilmoqda...
              </span>
            ) : "Ro'yxatdan o'tish"}
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