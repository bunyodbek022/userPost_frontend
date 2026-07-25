"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenTool, Bookmark, BarChart2, Globe, Bell, Search, ArrowRight } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    articles: 0,
    writers: 0,
    readers: 0
  });

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Stats count up animation
  useEffect(() => {
    const targets = { articles: 2400, writers: 580, readers: 14200 };
    const duration = 1800;

    const countUp = (key: keyof typeof targets) => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setStats(prev => ({
          ...prev,
          [key]: Math.floor(ease * targets[key])
        }));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        countUp('articles');
        countUp('writers');
        countUp('readers');
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });

    const statsEl = document.querySelector('.stats-section');
    if (statsEl) statsObserver.observe(statsEl);
    return () => statsObserver.disconnect();
  }, []);

  return (
    <div className="selection:bg-brand-orange/30 selection:text-orange-950 min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-14 py-6 flex items-center bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Link href="/" className="text-xl md:text-2xl font-serif font-bold tracking-tight text-gray-900">
          <span className="text-orange-600">Dev</span>Stories
        </Link>
        <div className="ml-auto flex items-center gap-6 md:gap-10">
          <Link href="/feed" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Maqolalar</Link>
          <a href="#" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Yozuvchilar</a>
          <Link href="/login" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
            Kirish
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 md:px-14 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-16">
        <div className="w-full md:w-1/2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold tracking-wide uppercase mb-6 opacity-0 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Yangi platforma
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6 opacity-0 animate-fade-up [animation-delay:0.1s]">
            Dasturlash haqida <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              jiddiy suhbatlar.
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed opacity-0 animate-fade-up [animation-delay:0.2s]">
            O'zbek tilidagi eng yirik developerlar hamjamiyatiga qo'shiling. Tajribangizni ulashing, bilim oling va o'z portfoliongizni yarating.
          </p>
          
          <div className="flex items-center gap-4 opacity-0 animate-fade-up [animation-delay:0.3s]">
            <Link href="/register" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-200">
              Yozishni boshlash <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/feed" className="inline-flex items-center px-8 py-3.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Maqolalarni o'qish
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="w-full md:w-1/2 relative opacity-0 animate-fade-up [animation-delay:0.4s]">
          <div className="relative rounded-2xl bg-[#0d1117] border border-gray-800 shadow-2xl overflow-hidden aspect-[4/3] w-full max-w-[600px] mx-auto">
            {/* Window header */}
            <div className="h-10 bg-[#161b22] border-b border-gray-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            {/* Editor content */}
            <div className="p-6 font-mono text-sm leading-relaxed text-gray-300">
              <p className="text-gray-500 mb-2">// Yangi maqola yaratish</p>
              <p><span className="text-[#ff7b72]">const</span> <span className="text-[#79c0ff]">post</span> <span className="text-[#ff7b72]">=</span> <span className="text-[#ff7b72]">await</span> <span className="text-[#d2a8ff]">createArticle</span>({'{'}</p>
              <p className="ml-4">title: <span className="text-[#a5d6ff]">'Next.js 14 va React Server Components'</span>,</p>
              <p className="ml-4">tags: [<span className="text-[#a5d6ff]">'react'</span>, <span className="text-[#a5d6ff]">'nextjs'</span>, <span className="text-[#a5d6ff]">'web'</span>],</p>
              <p className="ml-4">content: <span className="text-[#a5d6ff]">'Server komponentlari veb dasturlashda yangi sahifa ochdi...'</span>,</p>
              <p className="ml-4">published: <span className="text-[#79c0ff]">true</span></p>
              <p>{'}'});</p>
              <br />
              <p className="text-[#ff7b72]">console.<span className="text-[#d2a8ff]">log</span>(<span className="text-[#a5d6ff]">'Maqola chop etildi! 🚀'</span>);</p>
              <div className="w-2 h-4 bg-gray-400 animate-pulse mt-1 inline-block"></div>
            </div>
          </div>
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-orange-500/10 blur-[100px] -z-10 rounded-full"></div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-px">
          {[
            { label: 'Jami maqolalar', value: stats.articles, suffix: '+' },
            { label: 'Faol yozuvchilar', value: stats.writers, suffix: '+' },
            { label: 'Oylik o\'quvchilar', value: stats.readers, suffix: '+' },
            { label: 'O\'rtacha sifat', value: 4.9, suffix: '/5' }
          ].map((stat, i) => (
             <div key={i} className="reveal text-center md:border-r border-gray-200 last:border-0 px-4">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
                {typeof stat.value === 'number' && (i === 0 || i === 2) ? stat.value.toLocaleString() : stat.value}{stat.suffix}
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 md:py-32 px-6 md:px-14 max-w-7xl mx-auto">
        <div className="text-center mb-20 reveal">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Dasturchilar uchun <br className="hidden md:block"/> maxsus yaratilgan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Maqola yozish va o'qish jarayonini mukammal qilish uchun barcha kerakli vositalar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <PenTool className="w-6 h-6"/>, title: 'Professional Muharrir', desc: 'Markdown, kod bloklari va syntax highlighting bilan chalg\'ishlarsiz yozing.' },
            { icon: <Bookmark className="w-6 h-6"/>, title: 'Saqlangan Maqolalar', desc: 'Muhim bilimlarni yo\'qotmang. O\'z shaxsiy kutubxonangizni shakllantiring.' },
            { icon: <BarChart2 className="w-6 h-6"/>, title: 'Chuqur Analitika', desc: 'Maqolalaringiz qanchalik mashhur ekanligini real vaqt rejimida kuzatib boring.' },
            { icon: <Globe className="w-6 h-6"/>, title: 'O\'zbek Hamjamiyati', desc: 'O\'zbek tilidagi eng katta developerlar jamoasi bilan bilim almashing.' },
            { icon: <Bell className="w-6 h-6"/>, title: 'Bildirishnomalar', desc: 'Yangi maqolalar, izohlar va obunachilar haqida darhol xabardor bo\'ling.' },
            { icon: <Search className="w-6 h-6"/>, title: 'Tezkor Qidiruv', desc: 'Minglab maqolalar orasidan kerakli yechimni soniyalar ichida toping.' }
          ].map((f, i) => (
            <div key={i} className="reveal p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 mb-6 border border-gray-100">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Bilim ulashish vaqt-u sarhad tanlamaydi.
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            O'z bilimingizni boshqalar bilan bo'lishish orqali, o'zingiz ham o'sasiz. Hozirgi kunda tajriba almashish har qachongidan muhimroq.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-white text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Ro'yxatdan o'tish
            </Link>
            <Link href="/feed" className="w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-white border border-gray-700 hover:bg-gray-800 transition-colors">
              Maqolalarni ko'rish
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white pt-16 pb-8 px-6 md:px-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-gray-900">
            <span className="text-orange-600">Dev</span>Stories
          </Link>
          <div className="flex gap-8">
            {['Haqimizda', 'Qoidalar', 'Maxfiylik', 'Aloqa'].map((link, i) => (
              <a key={i} href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DevStories. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
}