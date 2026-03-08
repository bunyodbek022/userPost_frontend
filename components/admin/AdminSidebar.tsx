import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';

interface AdminSidebarProps {
    className?: string;
    onLinkClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '', onLinkClick }) => {
    const pathname = usePathname();

    const menuItems = [
        {
            label: 'Overview', href: '/admin', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            )
        },
        {
            label: 'Foydalanuvchilar', href: '/admin/users', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            )
        },
        {
            label: 'Maqolalar', href: '/feed', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
            )
        },
        {
            label: 'Analytics', href: '/admin/analytics', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            )
        },
        {
            label: 'Sozlamalar', href: '/admin/settings', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.72V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            )
        },
    ];

    return (
        <aside className={`bg-[#0f0e0d] text-white p-6 md:p-7 flex flex-col border-r border-white/5 ${className}`}>
            <div className="mb-12">
                <Logo size="md" className="text-white" />
                <p className="text-[9px] text-gray-500 font-bold tracking-[0.15em] uppercase mt-3">Admin Panel</p>
            </div>

            <nav className="flex-1 space-y-3">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onLinkClick}
                            className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-brand-orange/10 text-[#e8440a] shadow-lg shadow-black/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`${isActive ? 'text-[#e8440a]' : 'text-gray-500 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </span>
                            <span className="font-bold text-[13px] tracking-wide">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8430A] shadow-[0_0_10px_rgba(232,67,10,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-2xl bg-[#e8440a] flex items-center justify-center font-black text-white shadow-lg shadow-brand-orange/20">
                        B
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-bold truncate">bunyodbek</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Administrator</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
