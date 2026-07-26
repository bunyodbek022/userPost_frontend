import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../providers/ThemeProvider';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
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
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sidebarOpen');
            if (stored !== null) {
                setIsSidebarOpen(stored === 'true');
            } else {
                setIsSidebarOpen(window.innerWidth >= 1024);
            }
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebarOpen', String(newState));
            }
            return newState;
        });
    };

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
        <div className="min-h-screen bg-[var(--warm-paper)] dark:bg-[#0B1120] transition-colors duration-500 relative selection:bg-brand-orange/10 dark:selection:bg-brand-orange/20 font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50/50 dark:bg-orange-950/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50/50 dark:bg-purple-950/5 blur-[120px] rounded-full" />
            </div>

            <TopHeader
                onMenuClick={toggleSidebar}
                currentUser={currentUser}
                onLogout={handleLogout}
            />

            {/* Layout Wrapper */}
            <div className="flex pt-16 min-h-screen relative z-10 w-full">
                {/* Column 1: Persistent Desktop Sidebar */}
                <aside className={`hidden lg:block sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[280px] opacity-100 overflow-y-auto' : 'w-[80px] opacity-100'}`}>
                    <Sidebar
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        isCollapsed={!isSidebarOpen}
                        className="w-full h-full border-r border-gray-100 dark:border-[#2a2a2a]"
                    />
                </aside>

                {/* Mobile Bottom Navigation (Instagram Style) */}
                {currentUser && <BottomNav currentUser={currentUser} />}

                {/* Column 2: Main Content Area (Center) */}
                <main className={`flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-12 pb-24 lg:pb-6`}>
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
