"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    age: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const dataToSend = {
      ...formData,
      age: Number(formData.age)
    };

    try {
      await api.post('/auth/register', dataToSend);
      toast.success("Registration successful! Please login.");
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";

      if (Array.isArray(errorMessage)) {
        errorMessage.forEach((msg: any) => {
          if (typeof msg === 'string') {
            if (msg.toLowerCase().includes('email')) setErrors(prev => ({ ...prev, email: msg }));
            else if (msg.toLowerCase().includes('username')) setErrors(prev => ({ ...prev, userName: msg }));
            else if (msg.toLowerCase().includes('password')) setErrors(prev => ({ ...prev, password: msg }));
            else if (msg.toLowerCase().includes('age')) setErrors(prev => ({ ...prev, age: msg }));
            else toast.error(msg);
          }
        });
        if (errorMessage.length === 0) toast.error("Registration failed");
      } else if (typeof errorMessage === 'string') {
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('username')) {
          setErrors(prev => ({ ...prev, userName: errorMessage }));
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'O\'quvchilar', value: '10K+' },
    { label: 'Mavzular', value: '100+' },
  ];

  return (
    <AuthLayout
      title="Ro'yxatdan o'tish."
      subtitle="O'z hikoyangizni boshlang"
      quote="Fikr almashish orqali mukammallikka erishing."
      author="DevStories jamoasi"
      stats={stats}
    >
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            USERNAME
          </label>
          <Input
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="username"
            error={errors.userName}
            className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            AGE
          </label>
          <Input
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="yoshingiz"
            error={errors.age}
            className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            EMAIL
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@misol.uz"
            error={errors.email}
            className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
            PASSWORD
          </label>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
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
          Ro'yxatdan o'tish <span className="ml-2">→</span>
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
          Hisobingiz bormi?
          <Link href="/login" className="text-orange-600 dark:text-orange-400 font-bold ml-1 hover:underline decoration-2 underline-offset-4">
            Kirish
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}