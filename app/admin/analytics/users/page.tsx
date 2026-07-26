"use client";
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../../services/api';
import { AdminSidebar } from '../../../../components/admin/AdminSidebar';
import Link from 'next/link';

const Chart = ({ data, color, title, totalAll, totalFiltered }: { data: number[], color: string, title: string, totalAll: number, totalFiltered: number }) => {
    const max = Math.max(...data, 10);
    const height = 240;
    const width = 800;
    const padding = 20;
    const bottomPadding = 40;
    const leftPadding = 40;

    const displayCount = 12;

    const getPath = () => {
        if (data.length < 1) return '';
        const points = data.map((val, i) => ({
            x: (i * (width - leftPadding * 2)) / (11) + leftPadding,
            y: height - bottomPadding - ((val / max) * (height - bottomPadding - padding))
        }));

        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x},${points[i].y}`;
        }
        return d;
    };

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="bg-white dark:bg-[#1E293B] rounded-[24px] p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-8 mb-10 animate-fade-up">
            <div className="w-full md:w-[280px] flex flex-col gap-4 justify-center">
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">Umumiy {title}</p>
                    <p className="text-3xl font-black font-serif tracking-tight text-[#16120E] dark:text-white">{totalAll.toLocaleString()} <span className="text-sm font-bold text-gray-400">ta</span></p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">Filter bo'yicha</p>
                    <p className="text-3xl font-black font-serif tracking-tight text-[#16120E] dark:text-white">{totalFiltered.toLocaleString()} <span className="text-sm font-bold text-gray-400">ta</span></p>
                </div>
            </div>

            <div className="flex-1 relative h-[240px] w-full min-w-[300px]">
                <div className="absolute left-0 top-0 bottom-[40px] flex flex-col justify-between text-[9px] font-black uppercase tracking-widest text-gray-400 pointer-events-none">
                    <span>{max >= 1000000 ? (max / 1000000).toFixed(1) + ' mln' : max >= 1000 ? (max / 1000).toFixed(1) + ' k' : max}</span>
                    <span>{(max / 2) >= 1000000 ? ((max / 2) / 1000000).toFixed(1) + ' mln' : (max / 2) >= 1000 ? ((max / 2) / 1000).toFixed(1) + ' k' : Math.round(max / 2)}</span>
                    <span>0</span>
                </div>

                <div className="ml-10 h-full">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                            </linearGradient>
                        </defs>
                        
                        <path
                            d={`${getPath()} L ${width - leftPadding},${height - bottomPadding} L ${leftPadding},${height - bottomPadding} Z`}
                            fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
                            className="animate-fade-in"
                        />
                        
                        <path d={getPath()} fill="none" stroke={color} strokeWidth="2.5" className="animate-[draw_1.5s_ease-out]" />

                        {data.map((val, i) => {
                            const x = (i * (width - leftPadding * 2)) / (11) + leftPadding;
                            const y = height - bottomPadding - ((val / max) * (height - bottomPadding - padding));
                            return (
                                <g key={i} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" className="transition-all duration-300 group-hover/dot:r-5 group-hover/dot:stroke-width-3" />
                                    <rect x={x - 15} y={y - 30} width="30" height="18" rx="4" fill={color} className="opacity-0 group-hover/dot:opacity-100 transition-opacity" />
                                    <text x={x} y={y - 18} textAnchor="middle" fill="white" className="text-[10px] font-bold opacity-0 group-hover/dot:opacity-100 pointer-events-none">{val}</text>
                                </g>
                            );
                        })}
                        
                        <line x1={0} y1={height - bottomPadding} x2={width} y2={height - bottomPadding} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                    </svg>
                    
                    <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-gray-400 absolute bottom-0 left-10 right-0">
                        {monthLabels.map((m, i) => (
                            <span key={i}>{m}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function UsersAnalytics() {
    const [usersList, setUsersList] = useState<any[]>([]);
    const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [chartRes, tableRes] = await Promise.all([
                api.get('/users?limit=5000'), // All users for accurate chart
                api.get('/users', {
                    params: {
                        page,
                        limit: 10,
                        search,
                        sort: sort === 'alpha' ? 'alpha' : 'newest'
                    }
                })
            ]);
            
            const allUsers = chartRes.data.data || chartRes.data || [];
            setTotalUsers(allUsers.length);

            const monthsData = new Array(12).fill(0);
            allUsers.forEach((item: any) => {
                const date = new Date(item.createdAt);
                if (date.getFullYear() === selectedYear) {
                    monthsData[date.getMonth()]++;
                }
            });
            setChartData(monthsData);

            const { data, pagination: pagData } = tableRes.data;
            setUsersList(data || []);
            setPagination(pagData || { totalPages: 1, total: 0 });
        } catch (err) {
            console.error("Data fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, sort, selectedYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`${name} ismli foydalanuvchini o'chirmoqchimisiz?`)) return;
        try {
            await api.delete(`/users/${id}`);
            fetchData();
        } catch (err) {
            alert("O'chirishda xato yuz berdi");
        }
    };

    const filteredUsersCount = chartData.reduce((a, b) => a + b, 0);

    return (
        <>
            <div className="max-w-[1200px] mx-auto">
                    
                    {/* PAGE HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 animate-fade-up">
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight mb-2 text-[#16120E] dark:text-white">Foydalanuvchilar</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] sm:text-xs tracking-wide uppercase">Foydalanuvchilar statistikasi va ro'yxati</p>
                        </div>
                    </div>

                    {/* TOP CHART */}
                    <Chart 
                        data={chartData} 
                        color="#e8440a" 
                        title="Foydalanuvchilar" 
                        totalAll={totalUsers} 
                        totalFiltered={filteredUsersCount} 
                    />

                    {/* FILTERS BAR (like Screenshot 2) */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-[24px] p-8 border border-gray-100 dark:border-white/5 shadow-sm mb-10 animate-fade-up [animation-delay:100ms]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">Foydalanuvchilar Filtrlari</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    F.I.SH / Email
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ism yoki email bo'yicha..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#e8440a]/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#e8440a]/10 outline-none text-[#16120E] dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/></svg>
                                    Saralash
                                </label>
                                <select
                                    value={sort}
                                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#e8440a]/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#e8440a]/10 outline-none text-[#16120E] dark:text-white transition-all cursor-pointer appearance-none"
                                >
                                    <option value="newest">Yangi qo'shilganlar</option>
                                    <option value="alpha">Alifbo bo'yicha (A-Z)</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Yil bo'yicha (Chart)
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-[#e8440a]/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#e8440a]/10 outline-none text-[#16120E] dark:text-white transition-all cursor-pointer appearance-none"
                                >
                                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* USERS LIST */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden animate-fade-up [animation-delay:200ms]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Foydalanuvchi</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Rol</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Sana</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {loading && usersList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold text-sm">
                                                <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-[#e8440a] border-t-transparent" /></div>
                                            </td>
                                        </tr>
                                    ) : usersList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold text-[13px] uppercase tracking-wide">Foydalanuvchilar topilmadi</td>
                                        </tr>
                                    ) : (
                                        usersList.map((user) => (
                                            <tr key={user._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-sm ${user.role === 'admin' ? 'bg-[#e8440a]' : 'bg-[#1E293B] dark:bg-gray-700'}`}>
                                                            {user.userName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-sm text-[#16120E] dark:text-gray-200 group-hover:text-[#e8440a] transition-colors">{user.userName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-gray-500 font-medium text-xs">{user.email}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${user.role === 'admin' ? 'bg-orange-50 dark:bg-[#e8440a]/10 text-[#e8440a]' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                                                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-gray-500 font-medium text-xs">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/profile/${user._id}`}
                                                            className="p-2 text-gray-400 hover:text-[#e8440a] hover:bg-orange-50 dark:hover:bg-[#e8440a]/10 rounded-lg transition-all"
                                                            title="Profilni ko'rish"
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.userName)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
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
                        <div className="mt-8 flex justify-center items-center gap-2 pb-10">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 hover:text-[#e8440a] disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${page === i + 1
                                        ? 'bg-[#e8440a] text-white shadow-lg shadow-[#e8440a]/20'
                                        : 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 text-gray-400 hover:border-[#e8440a] hover:text-[#e8440a]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 hover:text-[#e8440a] disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>
                    )}
            </div>
        </>
    );
}
