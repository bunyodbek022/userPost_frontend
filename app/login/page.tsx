"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const router = useRouter();

  useEffect(() => {
    if (showOtp && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showOtp, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.success) {
        toast.success("Welcome back!");
        router.push('/feed');
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'UNVERIFIED_EMAIL') {
        toast.error("Emailingiz tasdiqlanmagan!");
        setUnverifiedEmail(err.response.data.email || formData.login);
      } else {
        const errorMessage = err.response?.data?.message || "Login failed";
        toast.error(errorMessage);
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
        toast.success("Welcome back!");
        router.push('/feed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!unverifiedEmail) return;
    setLoading(true);
    try {
      await api.post('/auth/resend-otp', { email: unverifiedEmail });
      toast.success("OTP kod yuborildi!");
      setShowOtp(true);
      setTimeLeft(600);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP yuborishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unverifiedEmail) return;
    setLoading(true);
    
    try {
      await api.post('/auth/verify-otp', { email: unverifiedEmail, otp });
      toast.success("Email tasdiqlandi!");
      
      // Auto login after verification
      const loginResponse = await api.post('/auth/login', formData);
      if (loginResponse.data.success) {
        toast.success("Tizimga muvaffaqiyatli kirdingiz!");
        router.push('/feed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP tasdiqlashda xatolik");
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
      
      {!showOtp ? (
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">
              LOGIN
            </label>
            <Input
              type="text"
              name="login"
              value={formData.login}
              placeholder="username yoki email"
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
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

          {unverifiedEmail && (
            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl text-center">
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                Emailingiz tasdiqlanmagan. Tizimga kirish uchun uni tasdiqlashingiz kerak.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSendOtp}
                isLoading={loading}
                className="w-full"
              >
                Tasdiqlash kodini yuborish
              </Button>
            </div>
          )}

          <Button
            type="submit"
            variant="orange"
            className="w-full rounded-xl shadow-lg shadow-orange-500/20 py-4 font-bold text-lg"
            isLoading={loading}
          >
            Kirish <span className="ml-2">→</span>
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
            Hisob yo'qmi?
            <Link href="/register" className="text-orange-600 dark:text-orange-400 font-bold ml-1 hover:underline decoration-2 underline-offset-4">
              Ro'yxatdan o'ting
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
              Kodni {unverifiedEmail} pochtasiga yubordik.
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
            Tasdiqlash va Kirish <span className="ml-2">→</span>
          </Button>

          {timeLeft === 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendOtp}
              className="w-full rounded-xl py-4 font-bold text-lg mt-4"
              isLoading={loading}
            >
              Kodni qayta yuborish
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowOtp(false)}
            className="w-full rounded-xl py-4 font-bold text-sm mt-2"
          >
            Ortga qaytish
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}