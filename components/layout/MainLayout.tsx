import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { TopHeader } from './TopHeader';
import { RightAside } from './RightAside';
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
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        // Initial state logic: close sidebar on mobile by default
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    const isPostPage = pathname?.startsWith('/posts/');

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
        <div className="min-h-screen bg-[var(--warm-paper)] dark:bg-[#0f0e0d] transition-colors duration-500 relative selection:bg-brand-orange/10 dark:selection:bg-brand-orange/20 font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50/50 dark:bg-orange-950/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/50 dark:bg-purple-950/5 blur-[120px] rounded-full" />
            </div>

            <TopHeader
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                currentUser={currentUser}
            />

            {/* Layout Wrapper */}
            <div className="flex pt-16 min-h-screen relative z-10 w-full max-w-[1500px] mx-auto">
                {/* Column 1: Persistent Desktop Sidebar */}
                <aside className={`hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                    <Sidebar
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        className="w-full h-full border-r border-gray-100 dark:border-[#2a2a2a]"
                    />
                </aside>

                {/* Mobile Sidebar Overlay & Drawer */}
                <div
                    className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${isSidebarOpen ? 'bg-black/20 backdrop-blur-[2px] pointer-events-auto' : 'bg-transparent backdrop-blur-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div
                        className={`absolute top-16 left-0 bottom-0 w-[280px] bg-white dark:bg-[#0f0f0f] shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <Sidebar
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* Column 2: Main Content Area (Center) */}
                <main className={`flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-12`}>
                    <div className={`${isPostPage ? 'max-w-3xl mx-auto' : 'max-w-[720px] mx-auto'}`}>
                        {children}
                    </div>
                </main>

                {/* Column 3: Right Aside (Staff Picks) */}
                {pathname === '/feed' && <RightAside />}
            </div>
        </div>
    );
};
