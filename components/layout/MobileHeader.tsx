import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick: () => void;
}

export const MobileHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3 h-16">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="text-2xl text-gray-700">
                    ☰
                </button>
                <Link href="/feed" className="text-xl font-bold italic tracking-tighter">
                    DevStories
                </Link>
            </div>

            <Link href="/create-post" className="text-2xl">
                ✍️
            </Link>
        </header>
    );
};
