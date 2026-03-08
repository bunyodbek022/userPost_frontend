"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.success) {
        toast.success("Welcome back!");
        router.push('/feed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Maqolalar', value: '2K+' },
    { label: 'Mualliflar', value: '500+' },
  ];

  return (
    <AuthLayout
      title="Xush kelibsiz."
      subtitle="Hisobingizga kiring"
      quote="Eng yaxshi kod — o'qilishi oson kod."
      author="DevStories jamoasi"
      stats={stats}
    >
      <Toaster position="top-center" />
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            USERNAME
          </label>
          <Input
            type="text"
            name="userName"
            value={formData.userName}
            placeholder="username"
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            PASSWORD
          </label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            placeholder="••••••••"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            required
            minLength={6}
          />
        </div>

        <Button
          type="submit"
          variant="orange"
          className="w-full rounded-xl shadow-lg shadow-orange-500/20 py-4 font-bold text-lg"
          isLoading={loading}
        >
          Kirish <span className="ml-2">→</span>
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
          Hisob yo'qmi?
          <Link href="/register" className="text-orange-600 dark:text-orange-400 font-bold ml-1 hover:underline decoration-2 underline-offset-4">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}