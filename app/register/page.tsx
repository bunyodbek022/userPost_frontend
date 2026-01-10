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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Backend-ga yuborishdan oldin yoshni raqamga o'tkazamiz
    const dataToSend = {
      ...formData,
      age: Number(formData.age)
    };

    try {
      await axios.post('http://localhost:3000/users/register', dataToSend);
      alert("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.");
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
            Hush kelibsiz!
          </h2>
          <p className="text-gray-500 mt-2">O'z blogingizni yaratish uchun ro'yxatdan o'ting</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Foydalanuvchi nomi</label>
            <input 
              required
              type="text" 
              placeholder="Masalan: johndoe" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Yoshingiz</label>
            <input 
              required
              type="number" 
              placeholder="Masalan: 25" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={(e) => setFormData({...formData, age: e.target.value})}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Email manzili</label>
            <input 
              required
              type="email" 
              placeholder="john@example.com" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 ml-1">Maxfiy parol</label>
            <input 
              required
              type="password" 
              placeholder="Kamida 6 ta belgi" 
              className="w-full p-3.5 mt-1 border-none bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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