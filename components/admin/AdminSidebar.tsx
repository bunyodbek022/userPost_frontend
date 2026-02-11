import Link from 'next/link';
import React from 'react';

interface AdminSidebarProps {
    className?: string;
    onLinkClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '', onLinkClick }) => {
    return (
        <aside className={`bg-black text-white p-8 flex flex-col ${className}`}>
            <div className="mb-12">
                <span className="text-2xl font-black tracking-tighter italic">DevStories</span>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-2">Admin Dashboard</p>
            </div>
            <nav className="flex-1 space-y-2">
                <Link
                    href="/admin"
                    onClick={onLinkClick}
                    className="flex items-center space-x-3 bg-white/10 p-4 rounded-2xl font-bold"
                >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Overview</span>
                </Link>
                <Link
                    href="/feed"
                    onClick={onLinkClick}
                    className="flex items-center space-x-3 text-gray-400 p-4 rounded-2xl hover:bg-white/5 transition font-bold"
                >
                    <span>Site View</span>
                </Link>
            </nav>
            <div className="pt-8 border-t border-white/10">
                <Link
                    href="/profile"
                    onClick={onLinkClick}
                    className="text-sm font-bold text-gray-500 hover:text-white transition underline underline-offset-4"
                >
                    My Profile
                </Link>
            </div>
        </aside>
    );
};
