"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminBottomNav: React.FC = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const isAnalyticsActive = pathname?.startsWith('/admin/analytics');

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-gray-100 dark:border-[#2a2a2a] z-50">
            <nav className="flex items-center justify-around h-14 px-2 mt-1 mb-2">

                {/* Overview */}
                <Link
                    href="/admin"
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                        isActive('/admin') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                    <span className="text-[10px] font-medium">Overview</span>
                </Link>

                {/* Analytics Users */}
                <Link
                    href="/admin/analytics/users"
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                        isActive('/admin/analytics/users') ? 'text-brand-orange' : isAnalyticsActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-[10px] font-medium">Users</span>
                </Link>

                {/* Analytics Posts */}
                <Link
                    href="/admin/analytics/posts"
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                        isActive('/admin/analytics/posts') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    <span className="text-[10px] font-medium">Analytics</span>
                </Link>

                {/* Settings */}
                <Link
                    href="/admin/settings"
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                        isActive('/admin/settings') ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.72V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="text-[10px] font-medium">Sozlamalar</span>
                </Link>

                {/* Back to Site */}
                <Link
                    href="/feed"
                    className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="22" height="22">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                    <span className="text-[10px] font-medium">Saytga</span>
                </Link>

            </nav>
        </div>
    );
};
