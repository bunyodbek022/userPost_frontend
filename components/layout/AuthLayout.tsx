import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl font-black italic tracking-tighter mb-4">DevStories</h1>
                    </Link>
                    <h2 className="text-3xl font-sans font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 text-lg">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
};
