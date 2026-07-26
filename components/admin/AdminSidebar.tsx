"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { useUserProfile } from '../../hooks/usePosts';
import { Avatar } from '../ui/Avatar';

interface AdminSidebarProps {
    className?: string;
    onLinkClick?: () => void;
    isCollapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '', onLinkClick, isCollapsed = false }) => {
    const pathname = usePathname();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const { data: currentUser } = useUserProfile();

    const menuItems = [
        {
            label: 'Overview', href: '/admin', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            )
        },
        {
            label: 'Analytics',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            ),
            children: [
                { label: 'Foydalanuvchilar', href: '/admin/analytics/users' },
                { label: 'Maqolalar', href: '/admin/analytics/posts' }
            ]
        },
        {
            label: 'Sozlamalar', href: '/admin/settings', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.72V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            )
        },
        {
            label: 'Asosiy sahifaga qaytish', href: '/feed', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
            )
        }
    ];

    useEffect(() => {
        if (pathname?.startsWith('/admin/analytics')) {
            setExpandedMenu('Analytics');
        }
    }, [pathname]);

    const toggleMenu = (label: string) => {
        setExpandedMenu(prev => prev === label ? null : label);
    };

    return (
        <aside className={`${className} bg-white dark:bg-[#0F172A] border-r border-gray-100 dark:border-[#2a2a2a] transition-all duration-300`}>
            <div className={`flex flex-col h-full py-4 ${isCollapsed ? 'px-2 items-center' : 'p-4 lg:p-6'}`}>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 w-full">
                    {menuItems.map((item) => {
                        const isDirectActive = item.href && (pathname === item.href || (item.href === '/admin' && pathname === '/admin'));
                        const hasChildren = !!item.children;
                        const isExpanded = expandedMenu === item.label;
                        const isChildActive = hasChildren && item.children!.some(child => pathname === child.href);

                        return (
                            <div key={item.label} className="relative group">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between py-3 rounded-xl transition-all duration-200 ${
                                            isCollapsed ? 'justify-center px-0' : 'px-4'
                                        } ${isChildActive
                                            ? 'bg-gray-50 dark:bg-white/5 text-[#292929] dark:text-white font-semibold shadow-sm'
                                            : 'text-[#757575] dark:text-[#999999] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#292929] dark:hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`transition-transform duration-200 flex-shrink-0 ${isChildActive ? 'text-brand-orange scale-110' : 'group-hover:scale-110'}`}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && (
                                                <span className="text-[14px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-gray-900 dark:text-white' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                        )}
                                        {isCollapsed && (
                                            <span className="absolute left-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold text-xs px-2 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        onClick={onLinkClick}
                                        className={`flex items-center gap-4 py-3 rounded-xl transition-all duration-200 relative ${
                                            isCollapsed ? 'justify-center px-0' : 'px-4'
                                        } ${isDirectActive
                                            ? 'bg-gray-50 dark:bg-white/5 text-brand-orange dark:text-brand-orange font-semibold shadow-sm'
                                            : 'text-[#757575] dark:text-[#999999] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#292929] dark:hover:text-white'
                                            }`}
                                    >
                                        <span className={`transition-transform duration-200 flex-shrink-0 ${isDirectActive ? 'scale-110 text-brand-orange' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </span>
                                        {!isCollapsed ? (
                                            <span className="text-[14px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                                        ) : (
                                            <span className="absolute left-14 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold text-xs px-2 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Accordion Content */}
                                {hasChildren && !isCollapsed && (
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                                        <div className="pl-12 pr-4 py-1 space-y-1 relative before:content-[''] before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200 dark:before:bg-[#333]">
                                            {item.children!.map(child => {
                                                const childActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={onLinkClick}
                                                        className={`block py-2 px-4 rounded-lg text-[13px] font-medium transition-all duration-200 ${childActive ? 'text-brand-orange bg-brand-orange/5 font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* User Profile matching Sidebar.tsx style */}
                <div className={`mt-auto pt-6 border-t border-gray-100 dark:border-[#2a2a2a] pb-4 w-full flex ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'px-0' : 'px-2'}`}>
                        <div className="relative group flex items-center justify-center">
                            <Avatar
                                src={currentUser?.avatar}
                                fallback={currentUser?.userName || 'A'}
                                alt={currentUser?.userName || 'User'}
                                size="sm"
                            />
                            {isCollapsed && (
                                <span className="absolute left-12 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold text-xs px-2 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-md">
                                    {currentUser?.userName}
                                </span>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden flex-1 flex flex-col justify-center">
                                <p className="font-bold text-sm tracking-tight truncate text-gray-900 dark:text-[#e0e0e0] leading-tight w-full">{currentUser?.userName || 'Yuklanmoqda...'}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5 tracking-wider">{currentUser?.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
