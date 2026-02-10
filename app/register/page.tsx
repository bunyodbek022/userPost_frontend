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

  return (
    <AuthLayout title="Join DevStories." subtitle="Create an account to verify your email.">
      <form onSubmit={handleRegister} className="space-y-6">
        <Input
          label="Username"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Your username"
          error={errors.userName}
          required
        />
        <Input
          label="Age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="Your age"
          error={errors.age}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          error={errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          required
          minLength={6}
        />

        <Button type="submit" className="w-full rounded-full" size="lg" isLoading={loading}>
          Sign up
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <Link href="/login" className="text-green-700 font-bold ml-1 hover:text-green-800">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}