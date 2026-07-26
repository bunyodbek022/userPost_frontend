"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';

interface BottomNavProps {
    currentUser: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentUser }) => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/feed' && pathname === '/') return true;
        return pathname === path;
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-gray-100 dark:border-[#2a2a2a] z-50 pb-safe">
            <nav className="flex items-center justify-around h-14 px-2 mb-2 mt-1">
                {/* Home */}
                <Link
                    href="/feed"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                        isActive('/feed') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive('/feed') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/feed') ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </Link>

                {/* Search / Explore */}
                <Link
                    href="/feed?focus=search"
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </Link>

                {/* Center Action Button (Write or Dashboard) */}
                <div className="flex flex-col items-center justify-center w-full h-full relative -top-1">
                    {isAdmin ? (
                        <Link
                            href="/admin"
                            className={`flex items-center justify-center w-11 h-11 rounded-full shadow-lg shadow-brand-orange/20 transition-transform hover:scale-105 active:scale-95 ${
                                isActive('/admin') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-brand-orange text-white'
                            }`}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="9"></rect>
                                <rect x="14" y="3" width="7" height="5"></rect>
                                <rect x="14" y="12" width="7" height="9"></rect>
                                <rect x="3" y="16" width="7" height="5"></rect>
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/create-post"
                            className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/20 transition-transform hover:scale-105 active:scale-95"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Bookmarks */}
                <Link
                    href="/bookmarks"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                        isActive('/bookmarks') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive('/bookmarks') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/bookmarks') ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </Link>

                {/* Profile */}
                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                        isActive('/profile') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {currentUser?.avatar ? (
                        <div className={`p-0.5 rounded-full ${isActive('/profile') ? 'border-[1.5px] border-brand-orange' : 'border-[1.5px] border-transparent'}`}>
                            <Avatar src={currentUser.avatar} fallback={currentUser.userName?.[0] || 'U'} alt={currentUser.userName || 'User'} size="sm" className="w-[22px] h-[22px] text-[10px]" />
                        </div>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive('/profile') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/profile') ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    )}
                </Link>
            </nav>
        </div>
    );
};
