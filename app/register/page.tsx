"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../services/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    age: '',
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 daqiqa (600 soniya)
  const router = useRouter();

  useEffect(() => {
    if (isOtpSent && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOtpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email: formData.email });
      toast.success("OTP kod qayta yuborildi!");
      setTimeLeft(600); // vaqtni yana 10 daqiqaga o'rnatish
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      toast.success("OTP email manzilingizga yuborildi. Iltimos tasdiqlang!");
      setIsOtpSent(true);
      setTimeLeft(600);
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

  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { token: credentialResponse.credential });
      if (response.data.success) {
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        router.push('/feed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      toast.success("Email tasdiqlandi! Endi tizimga kirishingiz mumkin.");
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP tasdiqlashda xatolik");
    } finally {
      setLoading(false);
    }
  }

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
      <Toaster position="top-center" />
      
      {!isOtpSent ? (
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

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">yoki</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google orqali ulanishda xatolik yuz berdi")}
              shape="rectangular"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
            Hisobingiz bormi?
            <Link href="/login" className="text-orange-600 dark:text-orange-400 font-bold ml-1 hover:underline decoration-2 underline-offset-4">
              Kirish
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
              OTP KOD (6 XONALI)
            </label>
            <Input
              name="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="!rounded-xl border-slate-200 dark:border-slate-800 focus:border-orange-500 dark:focus:border-orange-500 transition-colors tracking-widest text-center text-lg font-bold"
              required
              maxLength={6}
            />
            <p className="text-xs text-center text-gray-500 mt-2">
              Kodni {formData.email} pochtasiga yubordik.
            </p>
            <p className="text-sm font-bold text-center mt-4 mb-2">
              {timeLeft > 0 ? (
                <span className="text-slate-600 dark:text-slate-300">
                  Amal qilish vaqti: <span className="text-orange-500">{formatTime(timeLeft)}</span>
                </span>
              ) : (
                <span className="text-red-500">OTP kodining vaqti tugadi!</span>
              )}
            </p>
          </div>
          
          <Button
            type="submit"
            variant="orange"
            className="w-full rounded-xl shadow-lg shadow-orange-500/20 py-4 font-bold text-lg"
            isLoading={loading}
            disabled={timeLeft === 0}
          >
            Tasdiqlash <span className="ml-2">→</span>
          </Button>

          {timeLeft === 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendOtp}
              className="w-full rounded-xl py-4 font-bold text-lg mt-4"
              isLoading={loading}
            >
              Kodni qayta yuborish
            </Button>
          )}
        </form>
      )}
    </AuthLayout>
  );
}