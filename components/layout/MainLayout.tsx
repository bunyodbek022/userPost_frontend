import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useRouter } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import api from '../../services/api';

export interface User {
    _id: string;
    userName: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
}

interface MainLayoutProps {
    children: React.ReactNode;
    currentUser: User | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentUser }) => {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await api.post('/users/logout');
            router.push('/login');
        } catch (error) {
            console.error('Logout error', error);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#191919] transition-colors duration-300">
            {/* Desktop Sidebar */}
            <Sidebar
                currentUser={currentUser}
                onLogout={handleLogout}
                className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-20 xl:w-72"
            />

            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            {/* Mobile Sidebar Overlay (could be improved into a Drawer) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-white dark:bg-[#1f1f1f] w-64 h-full" onClick={e => e.stopPropagation()}>
                        <Sidebar
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            isMobile={true}
                            className="flex flex-col w-full h-full"
                        />
                    </div>
                </div>
            )}

            {/* Theme Toggle — Top Right */}
            <button
                onClick={toggleTheme}
                className="fixed top-5 right-5 z-50 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-[#252525]/80 backdrop-blur-md border border-gray-200 dark:border-[#333333] shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 group"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                aria-label="Toggle theme"
            >
                <div className="relative w-5 h-5">
                    {/* Sun icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className={`w-5 h-5 absolute inset-0 text-amber-500 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                    {/* Moon icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className={`w-5 h-5 absolute inset-0 text-indigo-500 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                </div>
            </button>

            {/* Main Content Area */}
            <main className="lg:ml-20 xl:ml-72 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
