"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black font-serif selection:bg-yellow-200">
      {/* Navigatsiya */}
      <nav className="border-b border-black py-4 px-6 md:px-20 bg-[#FBF9F6] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold tracking-tighter">DevStories</Link>
          <div className="flex items-center space-x-6 text-sm font-medium font-sans">
            <Link href="/login" className="hover:text-gray-600 transition">Sign in</Link>
            <Link href="/register" className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-[#242424] transition shadow-lg">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Estetik Dizayn */}
      <main className="relative overflow-hidden border-b border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-20 py-32 md:py-48 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-7xl md:text-[100px] leading-[0.9] font-bold tracking-tighter mb-8 italic">
              Ideas that <br /> change lives.
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 font-sans max-w-lg leading-relaxed mb-12">
              A place to read, write, and deepen your understanding. Explore the world's most insightful stories.
            </p>
            <Link href="/register" className="inline-block bg-black text-white text-xl px-12 py-4 rounded-full hover:bg-[#242424] transition-all transform hover:scale-105 active:scale-95 shadow-xl">
              Start Reading
            </Link>
          </div>
        </div>

        {/* Dekorativ Orqa Fon Elementi */}
        <div className="absolute right-[-10%] top-[10%] hidden lg:block select-none pointer-events-none">
          <span className="text-[500px] leading-none opacity-[0.03] font-serif font-black italic">
            D
          </span>
        </div>
      </main>

      {/* Footer / Pastki qism - Minimalist Linklar */}
      <footer className="py-10 px-6 bg-[#FBF9F6]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-xs font-sans text-gray-500 uppercase tracking-widest">
          <Link href="#" className="hover:text-black">Help</Link>
          <Link href="#" className="hover:text-black">Status</Link>
          <Link href="#" className="hover:text-black">About</Link>
          <Link href="#" className="hover:text-black">Careers</Link>
          <Link href="#" className="hover:text-black">Privacy</Link>
          <Link href="#" className="hover:text-black">Terms</Link>
        </div>
      </footer>
    </div>
  );
}