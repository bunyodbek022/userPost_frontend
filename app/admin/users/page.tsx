"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import Link from 'next/link';

const API_BASE = '/api';
axios.defaults.withCredentials = true;

export default function UsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/users`, {
                params: {
                    page,
                    limit: 10,
                    search,
                    sort: sort === 'alpha' ? 'alpha' : 'newest'
                }
            });
            const { data, pagination } = res.data;
            setUsers(data || []);
            setPagination(pagination || { totalPages: 1, total: 0 });
        } catch (err) {
            console.error("Userlarni yuklashda xato:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, sort]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`${name} ismli foydalanuvchini o'chirmoqchimisiz?`)) return;
        try {
            await axios.delete(`${API_BASE}/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("O'chirishda xato yuz berdi");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--warm-paper)] flex font-sans text-[var(--ink-black)]">
            <AdminSidebar className="w-[280px] hidden lg:flex sticky top-0 h-screen" />

            <main className="flex-1 p-6 lg:p-10 xl:p-12">
                <div className="max-w-7xl mx-auto">
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="animate-fade-up">
                            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight mb-2">Foydalanuvchilar</h1>
                            <p className="text-gray-400 font-bold text-xs tracking-wide">Tizim foydalanuvchilarini boshqarish</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto animate-fade-up [animation-delay:100ms]">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Qidirish (ism yoki email)..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full sm:w-64 bg-white border border-gray-100 rounded-2xl px-6 py-3.5 pl-12 text-sm font-bold outline-none focus:border-[#e8440a] focus:shadow-lg focus:shadow-orange-500/5 transition-all outline-none"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#e8440a] transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>

                            <select
                                value={sort}
                                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                className="bg-white border border-gray-100 rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:border-[#e8440a] cursor-pointer appearance-none min-w-[160px]"
                            >
                                <option value="newest">Yangi qo'shilganlar</option>
                                <option value="alpha">Alifbo bo'yicha</option>
                            </select>
                        </div>
                    </div>

                    {/* USERS LIST */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-fade-up [animation-delay:200ms]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Foydalanuvchi</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Rol</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Sana</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold text-sm">Yuklanmoqda...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold text-sm">Foydalanuvchilar topilmadi</td>
                                        </tr>
                                    ) : (
                                        users.map((user, idx) => (
                                            <tr key={user._id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-sm ${user.role === 'admin' ? 'bg-[#e8440a]' : 'bg-[#e8440a]/80'
                                                            }`}>
                                                            {user.userName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-sm group-hover:text-[#e8440a] transition-colors">{user.userName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-gray-400 font-medium text-xs">{user.email}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${user.role === 'admin' ? 'bg-orange-50 text-[#e8440a]' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-gray-400 font-medium text-xs">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/profile/${user._id}`}
                                                            className="p-2 text-gray-400 hover:text-[#e8440a] hover:bg-orange-50 rounded-lg transition-all"
                                                            title="Profilni ko'rish"
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.userName)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="O'chirish"
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    {!loading && pagination.totalPages > 1 && (
                        <div className="mt-10 flex justify-center items-center gap-2 animate-fade-up [animation-delay:300ms]">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#e8440a] disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${page === i + 1
                                        ? 'bg-[#e8440a] text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-white border border-gray-100 text-gray-400 hover:border-[#e8440a] hover:text-[#e8440a]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-[#e8440a] disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBILE TRIGGER */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="fixed bottom-8 right-8 lg:hidden w-14 h-14 rounded-full bg-[#0A0908] text-white flex items-center justify-center shadow-xl z-40 transition-transform active:scale-90"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
            </main>
        </div>
    );
}
