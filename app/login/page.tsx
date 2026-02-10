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

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to your account.">
      <Toaster position="top-center" />
      <form onSubmit={handleLogin} className="space-y-6">
        <Input
          label="Username"
          type="text"
          name="userName"
          value={formData.userName}
          placeholder="Your username"
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          placeholder="••••••••"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
        />

        <Button type="submit" className="w-full rounded-full" size="lg" isLoading={loading}>
          Sign in
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <Link href="/register" className="text-green-700 font-bold ml-1 hover:text-green-800">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}