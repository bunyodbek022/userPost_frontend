import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useRouter } from 'next/navigation';
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
        <div className="min-h-screen bg-white">
            {/* Desktop Sidebar */}
            <Sidebar currentUser={currentUser} onLogout={handleLogout} />

            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            {/* Mobile Sidebar Overlay (could be improved into a Drawer) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-white w-64 h-full p-4" onClick={e => e.stopPropagation()}>
                        <Sidebar currentUser={currentUser} onLogout={handleLogout} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="lg:ml-20 xl:ml-72 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
