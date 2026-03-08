"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CustomCursor } from '../components/ui/CustomCursor';

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
    <div className="selection:bg-brand-orange/30 selection:text-orange-950">
      <CustomCursor />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-14 py-8 flex items-center mix-blend-multiply pointer-events-none">
        <Link href="/" className="text-xl md:text-2xl font-serif font-bold tracking-tighter text-[var(--ink)] pointer-events-auto">
          <span className="text-[var(--orange)] italic">Dev</span>Stories
        </Link>
        <div className="ml-auto flex items-center gap-6 md:gap-14 pointer-events-auto">
          <Link href="/feed" className="hidden md:block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--ink2)] opacity-60 hover:opacity-100 transition-opacity">Maqolalar</Link>
          <a href="#" className="hidden md:block text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--ink2)] opacity-60 hover:opacity-100 transition-opacity">Yozuvchilar</a>
          <Link href="/login" className="bg-[var(--ink)] text-[var(--cream)] px-10 py-3.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[var(--orange)] hover:scale-105 transition-all duration-300 shadow-xl shadow-ink/20">
            Kirish
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero min-h-screen relative flex flex-col justify-center px-6 md:px-14 py-32 overflow-hidden bg-[var(--cream)]">
        {/* Floating Orbs */}
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-brand-orange/5 blur-[100px] animate-orb-float pointer-events-none" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-[#c4aa88]/15 blur-[80px] animate-orb-float pointer-events-none [animation-direction:reverse] [animation-duration:9s]" />

        {/* Background 'D' */}
        <div className="absolute right-[-2vw] top-1/2 -translate-y-1/2 font-serif text-[clamp(240px,25vw,400px)] font-black italic select-none pointer-events-none leading-none animate-bg-drift" style={{ WebkitTextStroke: '1.5px var(--tan-light)', color: 'transparent' }}>
          D
        </div>

        <div className="relative z-10 max-w-5xl self-start">
          <div className="w-16 h-[2px] bg-[var(--orange)] mb-10 origin-left animate-rule-grow [animation-delay:0.2s]" />
          <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--orange)] mb-6 opacity-0 animate-fade-up [animation-delay:0.4s] [animation-duration:0.6s]">
            Dev yozuvchilar platformasi — 2026
          </div>

          <h1 className="font-serif text-[clamp(44px,7.5vw,100px)] font-black leading-[0.95] tracking-tight mb-14 opacity-0 animate-fade-up [animation-delay:0.55s]">
            G'oyalar<br />
            <em className="italic text-[var(--orange)] relative px-2">
              hayotni
              <span className="absolute left-0 bottom-1 md:bottom-2 right-0 h-1 md:h-2 bg-[var(--orange)]/10 -skew-x-12" />
            </em><br />
            o'zgartiradi.
          </h1>

          <div className="flex flex-col md:flex-row items-baseline gap-12 mt-4 opacity-0 animate-fade-up [animation-delay:0.85s] [animation-duration:0.7s]">
            <p className="max-w-md text-base md:text-lg leading-relaxed text-[#5a5248] font-medium">
              O'qish, yozish va tushunishingizni chuqurlashtirish uchun joy. Dunyoning eng ta'sirli developer hikoyalarini kashf eting.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/register" className="group inline-flex items-center gap-4 bg-[var(--ink)] text-[var(--cream)] px-10 py-4.5 rounded-full text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[var(--orange)] hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-ink/30">
                O'QISHNI BOSHLANG <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link href="/register" className="inline-flex items-center px-4 py-4 text-[10px] font-black tracking-[0.2em] uppercase border-b border-[var(--tan)] hover:text-[var(--orange)] hover:border-[var(--orange)] transition-all">
                Yozuvchi bo'l
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-16 left-6 md:left-14 flex items-center gap-5 text-[10px] font-black tracking-[0.2em] uppercase text-[var(--tan)] opacity-0 animate-fade-up [animation-delay:1.5s] [animation-duration:1s]">
          <div className="relative w-12 h-[1px] bg-[var(--tan)] overflow-hidden">
            <div className="absolute inset-0 bg-[var(--orange)] -translate-x-full animate-scroll-line" />
          </div>
          PASTGA SURING
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-[var(--ink)] py-6 overflow-hidden flex border-y border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex">
              {['Programming', 'Design', 'Open Source', 'Career', 'Architecture', 'Web Dev', 'AI & ML', 'DevOps'].map((cat, j) => (
                <div key={j} className="flex items-center gap-8 px-12 text-[10px] font-black tracking-[0.3em] uppercase text-white/30 hover:text-white transition-colors cursor-default">
                  <div className="w-1 h-1 rounded-full bg-[var(--orange)]" />
                  {cat}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="stats-section bg-[var(--tan-light)] grid grid-cols-2 md:grid-cols-4 gap-px border-y border-[var(--tan-light)]">
        {[
          { label: 'Jami maqolalar', value: stats.articles, suffix: ',' },
          { label: 'Faol yozuvchilar', value: stats.writers, suffix: '' },
          { label: 'Oylik o\'quvchilar', value: stats.readers, suffix: ',' },
          { label: 'O\'rtacha baho', value: 4.9, suffix: '★' }
        ].map((stat, i) => (
          <div key={i} className="reveal bg-[var(--cream)] p-10 md:p-14 hover:bg-[var(--ink)] group transition-colors duration-500 border-r border-[var(--tan-light)] last:border-r-0">
            <div className="w-8 h-[2px] bg-[var(--orange)] mb-8" />
            <div className="font-serif text-5xl md:text-6xl font-black mb-3 text-[var(--ink)] group-hover:text-white transition-colors duration-500 leading-none">
              {typeof stat.value === 'number' && (i === 0 || i === 2) ? stat.value.toLocaleString() : stat.value}{stat.suffix}
            </div>
            <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#7a7068] group-hover:text-white/40 transition-colors duration-500">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-14 py-24 md:py-32 bg-[var(--cream)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 md:mb-24 reveal">
          <div>
            <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[var(--orange)] mb-5">Nima uchun DevStories?</div>
            <h2 className="font-serif text-4xl md:text-[64px] font-black leading-[1.0] tracking-tighter">Dasturchi uchun<br />yaratilgan platforma</h2>
          </div>
          <Link href="/register" className="text-[10px] font-black tracking-[0.25em] uppercase border-b-2 border-[var(--tan)] hover:border-[var(--orange)] transition-colors pb-1 mb-2">
            BARCHA IMKONYATLAR →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--tan-light)] border border-[var(--tan-light)]">
          {[
            { id: '01', icon: '✍️', title: 'Kuchli muharrir', desc: 'Markdown qo\'llab-quvvatlash, kod bloklari, syntax highlighting. Yozish jarayoni chiroyli va qulay.' },
            { id: '02', icon: '🔖', title: 'Reading List', desc: 'Maqolalarni keyinroq o\'quvchi uchun saqalng. Shaxsiy kutubxonangizni yarating.', dark: true, iconBg: 'bg-[#e8440a]', iconColor: 'text-white' },
            { id: '03', icon: '📊', title: 'Analytics Dashboard', desc: 'Maqolalaringizning ta\'sirini ko\'ring. O\'quvchilar soni, o\'qish vaqti, reaksiyalar.' },
            { id: '04', icon: '🌐', title: 'Hamjamiyat', desc: 'O\'zbek va jahon developerlari bilan ulaning. Tajriba almashing, birga o\'sing.', dark: true, iconBg: 'bg-orange-500', iconColor: 'text-white', dot: true },
            { id: '05', icon: '🔔', title: 'Smart Notifications', desc: 'Yangi maqolalar, izohlar, followerlar haqida darhol xabardor bo\'ling.' },
            { id: '06', icon: '⚡', title: 'Tezkor qidiruv', desc: 'Kategoriya, muallif, kalit so\'z bo\'yicha filterlash. Kerakli maqolani bir zumda toping.' }
          ].map((f, i) => (
            <div key={i} className={`reveal p-10 md:p-14 group transition-colors duration-500 relative ${f.dark ? 'bg-[var(--ink2)] text-white' : 'bg-[var(--cream)]'}`}>
              <div className={`text-[10px] font-sans font-black mb-10 tracking-[0.3em] ${f.dark ? 'text-white/20' : 'text-[var(--tan)]'}`}>
                {f.id}
              </div>
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl mb-10 shadow-sm transition-transform group-hover:scale-110 duration-300 ${f.iconBg || 'bg-[var(--orange-soft)]'} ${f.iconColor || ''}`}>
                {f.icon}
              </div>
              <h3 className={`font-serif text-2xl md:text-2xl font-black mb-5 leading-tight ${f.dark ? 'text-white' : 'text-[var(--ink)]'}`}>
                {f.title}
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${f.dark ? 'text-white/50' : 'text-[#7a7068]'}`}>
                {f.desc}
              </p>
              {f.dot && (
                <div className="absolute bottom-12 right-12 w-3.5 h-3.5 rounded-full bg-[var(--orange)]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED STORY */}
      <section className="px-6 md:px-14 pb-24 md:pb-32 bg-[var(--cream)]">
        <div className="reveal bg-[var(--ink)] rounded-[40px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[560px] shadow-3xl shadow-ink/40 relative">
          <div className="p-10 md:p-20 flex flex-col justify-between items-start relative z-10">
            <div className="w-full">
              <div className="inline-block px-5 py-2 rounded-full border border-[var(--orange)]/30 text-[10px] font-black tracking-[0.3em] uppercase text-[var(--orange)] mb-12">
                ✦ TAVSIYA ETILGAN MAQOLA
              </div>
              <h2 className="font-serif text-3xl md:text-[52px] font-black text-white leading-[1.05] tracking-tighter mb-10">
                Biz tarixiy davrda yashayapmiz, lekin buni sezishga ulgurmayapmiz
              </h2>
              <div className="flex items-center gap-4 mb-12">
                <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md font-medium">
                  Hozir dunyoda hamma narsa haddan tashqari tez bo'layapti. Shunchalik tezki, inson o'ylab ulgurmayapti, his qilib ham ulgurmayapti...
                </p>
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--orange)] flex-shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-6 w-full">
              <div className="w-14 h-14 rounded-2xl bg-[var(--orange)] flex items-center justify-center font-black text-white text-xl shadow-xl shadow-orange-500/30">
                B
              </div>
              <div>
                <div className="text-white font-bold text-base">bunyodbek</div>
                <div className="text-white/40 text-[11px] tracking-[0.1em] uppercase font-bold">27 Fevral · 3 min o'qish</div>
              </div>
              <button className="ml-auto w-20 h-20 rounded-full bg-[var(--orange)] text-white text-3xl flex items-center justify-center hover:scale-110 hover:-rotate-12 transition-all duration-500 shadow-2xl shadow-brand-orange/30">
                ↗
              </button>
            </div>
          </div>

          <div className="hidden lg:flex relative bg-gradient-to-br from-[#1e1a15] to-[#2e261c] items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <div className="font-serif text-[420px] font-black italic text-white animate-letter-pulse" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)', color: 'transparent' }}>
                D
              </div>
            </div>

            <div className="relative w-full max-w-sm flex flex-col gap-5 p-10">
              {[
                { title: "Bugun havo ochiq", meta: "bunyodbek · Feb 10" },
                { title: "JavaScript'da async/await", meta: "testuser · Feb 11", offset: true },
                { title: "Salom, DevStories!", meta: "bunyodbek · Feb 17" }
              ].map((card, i) => (
                <div key={i} className={`bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] transition-all duration-500 hover:translate-x-6 cursor-default group/card ${card.offset ? 'ml-10' : ''}`}>
                  <div className="text-white/80 font-bold mb-1.5 group-hover/card:text-white transition-colors">{card.title}</div>
                  <div className="text-white/30 text-[9px] tracking-[0.2em] uppercase font-black group-hover/card:text-white/50 transition-colors">{card.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-14 py-24 md:py-40 text-center relative overflow-hidden bg-[var(--cream)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(232,68,10,0.08),transparent)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--orange)] mb-8">BUGUN BOSHLANG</div>
          <h2 className="reveal font-serif text-[clamp(40px,7vw,90px)] font-black leading-[0.95] tracking-tighter mb-12">
            Hikoyangizni<br />
            <em className="italic text-[var(--orange)]">dunyo</em> bilan<br />
            ulashing.
          </h2>
          <p className="reveal text-lg md:text-xl text-[#7a7068] max-w-lg mb-16 leading-relaxed font-medium">
            Bepul ro'yxatdan o'ting va o'z g'oyalaringizni minglab dasturchilar bilan baham ko'ring.
          </p>
          <div className="reveal flex flex-col md:flex-row items-center gap-6">
            <Link href="/register" className="inline-flex items-center gap-4 bg-[var(--ink)] text-[var(--cream)] px-12 py-5 rounded-full text-[13px] font-black tracking-[0.2em] uppercase hover:bg-[var(--orange)] hover:-translate-y-1 transition-all duration-300 shadow-3xl shadow-ink/40">
              HOZIR QO'SHILING <span className="text-2xl">→</span>
            </Link>
            <Link href="/register" className="text-[10px] font-black tracking-[0.3em] uppercase border-b-2 border-[var(--tan)] hover:border-[var(--orange)] transition-colors pb-1">
              MAQOLALARNI KO'RISH
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-14 py-16 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-[var(--tan-light)] bg-[var(--cream)]">
        <Link href="/" className="text-2xl font-serif font-black tracking-tighter text-[var(--ink)]">
          <span className="text-[var(--orange)] italic">Dev</span>Stories
        </Link>
        <div className="text-[11px] font-black text-[var(--tan)] uppercase tracking-[0.2em]">
          © 2026 DevStories. BARCHA HUQUQLAR HIMOAYLANGAN.
        </div>
        <div className="flex gap-10">
          {['Haqimizda', 'Blog', 'Maxfiylik', 'Aloqa'].map((link, i) => (
            <a key={i} href="#" className="text-[11px] font-black tracking-[0.2em] text-[#7a7068] uppercase hover:text-[var(--orange)] transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}