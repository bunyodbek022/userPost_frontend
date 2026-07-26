"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';

interface TopHeaderProps {
    onMenuClick: () => void;
    currentUser: any;
    onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick, currentUser, onLogout }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme, toggleTheme } = useTheme();
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const [isSearchExpanded, setIsSearchExpanded] = React.useState(searchParams.has('search') || searchParams.get('focus') === 'search');
    const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

    const currentSearch = searchParams.get('search') || '';
    const focusSearch = searchParams.get('focus') === 'search';

    // Update URL debounced
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchValue !== currentSearch) {
                const params = new URLSearchParams(window.location.search);
                if (searchValue.trim()) {
                    params.set('search', searchValue.trim());
                } else {
                    params.delete('search');
                }
                params.delete('focus');
                router.push(`/feed?${params.toString()}`);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchValue, router, currentSearch]);

    React.useEffect(() => {
        if (focusSearch) {
            setIsSearchExpanded(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [focusSearch]);

    const handleSearchClick = () => {
        if (!isSearchExpanded) {
            setIsSearchExpanded(true);
            router.push('/feed?focus=search');
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLInputElement;
            setSearchValue(target.value);
            const params = new URLSearchParams(searchParams);
            if (target.value.trim()) {
                params.set('search', target.value.trim());
            } else {
                params.delete('search');
            }
            params.delete('focus');
            router.push(`/feed?${params.toString()}`);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[60] bg-[#F9FAFB]/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between px-4 lg:px-6 h-16 transition-colors duration-300">
            <div className={`flex items-center gap-4 lg:gap-6 ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
                <button
                    onClick={onMenuClick}
                    className="hidden lg:block p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
                    title="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <Link href="/feed" className="flex items-center">
                    <Logo size="sm" />
                </Link>

                {/* Desktop Search Bar */}
                <div className="hidden md:flex items-center ml-4">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search"
                            className="w-56 lg:w-[320px] pl-11 pr-5 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-transparent rounded-full text-[15px] focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/30 dark:focus:bg-[#252525] transition-all outline-none"
                            key={searchValue === '' ? 'empty' : 'valued'}
                            defaultValue={searchValue}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={handleSearchClick}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Search Input (Visible when expanded) */}
            {isSearchExpanded && (
                <div className="flex-1 md:hidden flex items-center mx-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-orange">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search stories..."
                            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-transparent rounded-full text-sm focus:ring-1 focus:ring-brand-orange/30 focus:border-brand-orange/30 outline-none"
                            defaultValue={searchValue}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                setIsSearchExpanded(false);
                                setSearchValue('');
                                if (currentSearch) {
                                    const params = new URLSearchParams(searchParams);
                                    params.delete('search');
                                    router.push(`/feed?${params.toString()}`);
                                }
                            }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className={`items-center gap-3 lg:gap-5 ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile Search Icon */}
                <button
                    onClick={handleSearchClick}
                    className="md:hidden text-gray-600 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white transition-colors p-1.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>

                <Link
                    href="/create-post"
                    className="flex items-center gap-2 text-[#757575] dark:text-[#999999] hover:text-brand-orange dark:hover:text-brand-orange transition-colors font-medium text-sm"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span className="hidden sm:inline">Write</span>
                </Link>

                <button
                    onClick={toggleTheme}
                    className="text-gray-600 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white transition-all p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1E293B]"
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    )}
                </button>

                {currentUser && (
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-2 group focus:outline-none"
                        >
                            <Avatar
                                src={currentUser.avatar}
                                fallback={currentUser.userName?.[0] || 'U'}
                                alt={currentUser.userName || 'User'}
                                size="sm"
                                className="ring-2 ring-transparent group-hover:ring-brand-orange/30 transition-all border border-gray-100 dark:border-[#333]"
                            />
                        </button>
                        
                        {isProfileMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsProfileMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a2a2a] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-[#2a2a2a] mb-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentUser.userName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                                    </div>
                                    <Link 
                                        href="/profile" 
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            onLogout();
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
