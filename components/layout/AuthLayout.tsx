import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#191919] flex flex-col items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl font-black italic tracking-tighter mb-4 dark:text-[#e0e0e0]">DevStories</h1>
                    </Link>
                    <h2 className="text-3xl font-sans font-bold text-gray-900 dark:text-[#e0e0e0] mb-2">{title}</h2>
                    <p className="text-gray-500 dark:text-[#999999] text-lg">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};
