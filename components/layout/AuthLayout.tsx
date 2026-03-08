import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    quote?: string;
    author?: string;
    stats?: { label: string; value: string }[];
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    quote,
    author,
    stats
}) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#0f172a] transition-colors overflow-x-hidden">
            {/* Left Panel - Branding & Inspiration */}
            <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-[#0e1111] p-12 lg:p-20 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
                {/* Background Glow */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-block mb-12">
                        <Logo size="lg" className="!text-white" />
                    </Link>

                    {quote && (
                        <div className="mt-20 max-w-sm">
                            <h2 className="text-4xl lg:text-5xl font-serif italic mb-6 leading-tight text-white/90">
                                "{quote}"
                            </h2>
                            {author && (
                                <p className="text-white/40 font-sans tracking-widest text-sm font-medium uppercase">
                                    — {author}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {stats && (
                    <div className="relative z-10 grid grid-cols-2 gap-8 mt-auto pb-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="group">
                                <p className="text-3xl lg:text-4xl font-bold mb-1 tracking-tight group-hover:text-orange-500 transition-colors duration-300">
                                    {stat.value}
                                </p>
                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-20 relative">
                <div className="w-full max-w-md">
                    {/* Mobile Logo Only */}
                    <div className="md:hidden text-center mb-12">
                        <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                            <Logo size="lg" />
                        </Link>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-4xl lg:text-5xl font-serif mb-4 text-slate-900 dark:text-white leading-tight">
                            {title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            {subtitle}
                        </p>
                    </div>

                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
