"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminBottomNav } from '../../components/admin/AdminBottomNav';
import { TopHeader } from '../../components/layout/TopHeader';
import { useUserProfile } from '../../hooks/usePosts';
import api from '../../services/api';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { data: currentUser } = useUserProfile();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('adminSidebarOpen');
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
                localStorage.setItem('adminSidebarOpen', String(newState));
            }
            return newState;
        });
    };

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
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B1120] transition-colors duration-500 relative selection:bg-brand-orange/10 dark:selection:bg-brand-orange/20 font-sans">
            <TopHeader
                onMenuClick={toggleSidebar}
                currentUser={currentUser}
                onLogout={handleLogout}
            />

            <div className="flex pt-16 min-h-screen relative z-10 w-full">
                {/* Desktop Sidebar */}
                <aside className={`hidden lg:block sticky top-16 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[280px] opacity-100 overflow-y-auto' : 'w-[80px] opacity-100'}`}>
                    <AdminSidebar 
                        className="w-full h-full" 
                        isCollapsed={!isSidebarOpen} 
                    />
                </aside>

                {/* Mobile Bottom Navigation */}
                <AdminBottomNav />

                <main className={`flex-1 min-w-0 p-4 md:p-8 lg:p-10 xl:p-12 overflow-y-auto h-[calc(100vh-64px)] pb-24 lg:pb-10`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
