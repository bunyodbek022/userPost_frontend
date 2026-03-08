"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';

interface User {
    _id: string;
    userName: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
}

interface SidebarProps {
    currentUser: User | null;
    onLogout: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps & { className?: string; isMobile?: boolean }> = ({
    currentUser,
    onLogout,
    isCollapsed = false,
    onToggleCollapse,
    className = '',
    isMobile = false
}) => {
    const pathname = usePathname();

    const navItems = [
        {
            href: '/feed',
            label: 'Home',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            )
        },
        {
            href: '/profile',
            label: 'Profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            )
        },
        {
            href: '/bookmarks',
            label: 'Reading List',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
            )
        },
    ];

    if (currentUser?.role === 'admin') {
        navItems.push({
            href: '/admin',
            label: 'Dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                </svg>
            )
        });
    }

    return (
        <aside className={`${className} bg-white dark:bg-[#0f0f0f] border-r border-gray-100 dark:border-[#2a2a2a] transition-all duration-300`}>
            <div className="flex flex-col h-full p-4 lg:p-6">
                {/* Navigation */}
                <nav className="flex-1 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gray-50 dark:bg-white/5 text-[#292929] dark:text-white font-semibold shadow-sm'
                                    : 'text-[#757575] dark:text-[#999999] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#292929] dark:hover:text-white'
                                    }`}
                                title={item.label}
                            >
                                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                <span className="text-[15px] tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}

                    <Link
                        href="/create-post"
                        className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white mt-10 transition-all duration-300 group shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98]"
                        title="Write"
                    >
                        <span className="text-xl">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Write">
                                <path d="M14 4a.5.5 0 0 0 0-1v1zm7 6a.5.5 0 0 0-1 0h1zm-7-7H4v1h10V3zM3 4v16h1V4H3zm1 17h16v-1H4v1zm17-1V10h-1v10h1zm-1 1a1 1 0 0 0 1-1h-1v1zM3 20a1 1 0 0 0 1-1v-1H3zM4 3a1 1 0 0 0-1 1h1V3z" fill="currentColor"></path>
                                <path d="M17.5 4.5l-8.46 8.46a.25.25 0 0 0-.06.1l-.6 2.1c-.07.25.17.49.42.42l2.1-.6a.25.25 0 0 0 .1-.06l8.46-8.46a1.5 1.5 0 0 0-2.1-2.1l-.06.1z" stroke="currentColor" strokeLinecap="round"></path>
                            </svg>
                        </span>
                        <span className="text-[15px] font-bold">Write</span>
                    </Link>
                </nav>

                {/* User Profile & Logout */}
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-[#2a2a2a] pb-4">
                    <div className="flex items-center gap-3 px-2">
                        <Avatar
                            src={currentUser?.avatar}
                            fallback={currentUser?.userName || '?'}
                            alt={currentUser?.userName || 'User'}
                            size="sm"
                        />
                        <div className="overflow-hidden flex-1">
                            <p className="font-bold text-sm truncate dark:text-[#e0e0e0] leading-tight">{currentUser?.userName}</p>
                            <button
                                onClick={onLogout}
                                className="text-xs text-[#757575] hover:text-[#292929] dark:text-[#999999] dark:hover:text-white transition"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
