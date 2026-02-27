import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';

interface HeaderProps {
    onMenuClick: () => void;
}

export const MobileHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const handleSearchClick = () => {
        router.push('/feed?focus=search');
    };

    return (
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#191919]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#333333] flex items-center justify-between px-4 py-3 h-16 transition-colors">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="text-2xl text-gray-700 dark:text-[#999999]">
                    ☰
                </button>
                <Link href="/feed" className="text-xl font-bold italic tracking-tighter dark:text-[#e0e0e0]">
                    DevStories
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {/* Search Icon */}
                <button
                    onClick={handleSearchClick}
                    className="text-gray-600 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white transition-colors p-1.5"
                    title="Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-gray-600 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white transition-all p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#252525] active:scale-90"
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    )}
                </button>

                {/* Write Icon */}
                <Link href="/create-post" className="text-gray-600 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white transition-colors p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </Link>
            </div>
        </header>
    );
};
