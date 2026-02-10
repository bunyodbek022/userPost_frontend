import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';

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
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
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
        <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-20 xl:w-72 bg-white border-r border-gray-100 transition-all duration-300">
            <div className="flex flex-col h-full p-4 xl:p-6">
                {/* Logo */}
                <div className="mb-10 flex justify-center xl:justify-start">
                    <Link href="/feed" className="block">
                        <span className="text-3xl xl:hidden">DS</span>
                        <h1 className="hidden xl:block text-3xl font-black italic tracking-tighter">DevStories</h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-3 xl:px-4 py-3 rounded-full transition-all group ${isActive ? 'bg-gray-100 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                    }`}
                                title={item.label}
                            >
                                <span className={`text-xl group-hover:scale-110 transition-transform ${isActive ? 'text-black' : 'text-gray-500'}`}>{item.icon}</span>
                                <span className="hidden xl:inline text-lg">{item.label}</span>
                            </Link>
                        );
                    })}

                    <Link
                        href="/create-post"
                        className="flex items-center gap-4 px-3 xl:px-4 py-3 rounded-full text-gray-600 hover:bg-gray-50 hover:text-black mt-4 group"
                        title="Write"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </span>
                        <span className="hidden xl:inline text-lg">Write</span>
                    </Link>
                </nav>

                {/* User Profile & Logout */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="flex flex-col xl:flex-row items-center gap-3">
                        <Avatar
                            src={currentUser?.avatar}
                            fallback={currentUser?.userName || '?'}
                            alt={currentUser?.userName || 'User'}
                        />
                        <div className="hidden xl:block overflow-hidden">
                            <p className="font-bold text-sm truncate w-32">{currentUser?.userName}</p>
                            <button
                                onClick={onLogout}
                                className="text-xs text-red-600 hover:text-red-800 transition"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                    {/* Mobile/Tablet Logout Icon */}
                    <button
                        onClick={onLogout}
                        className="xl:hidden mt-4 text-red-600 hover:text-red-800 transition flex justify-center w-full"
                        title="Log out"
                    >
                        🚪
                    </button>
                </div>
            </div>
        </aside>
    );
};
