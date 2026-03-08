"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';

const API_BASE = '/api';
axios.defaults.withCredentials = true;

const Chart = ({ data, color, title, label, year }: { data: number[], color: string, title: string, label: string, year: number }) => {
    const max = Math.max(...data, 10);
    const height = 180;
    const width = 800;
    const padding = 40;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine how many months to show
    const displayCount = year < currentYear ? 12 : (year === currentYear ? currentMonth + 1 : 0);

    const getPath = () => {
        if (displayCount < 1) return '';

        const allPoints = data.map((val, i) => ({
            x: (i * (width - padding * 2)) / (data.length - 1) + padding,
            y: height - ((val / max) * (height - padding * 2) + padding)
        }));

        const visiblePoints = allPoints.slice(0, displayCount);
        if (visiblePoints.length < 1) return '';

        let d = `M ${visiblePoints[0].x},${visiblePoints[0].y}`;

        for (let i = 0; i < visiblePoints.length - 1; i++) {
            const p0 = visiblePoints[i];
            const p1 = visiblePoints[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + (p1.x - p0.x) * 2 / 3;
            d += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="bg-white rounded-[32px] p-6 md:p-7 border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:shadow-gray-200/40 border-l-[4px]" style={{ borderLeftColor: color }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mb-1">{label}</h3>
                    <div className="text-lg font-serif font-black tracking-tight">{title} <span className="text-gray-300 font-sans ml-1 text-sm">({year})</span></div>
                </div>
            </div>

            <div className="relative h-[180px] w-full">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-[30px] text-[8px] font-black text-gray-300 pointer-events-none">
                    <span>{max.toLocaleString()}</span>
                    <span>{(max / 2).toLocaleString()}</span>
                    <span>0</span>
                </div>

                <div className="ml-8 h-full">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.06" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {[0, 0.5, 1].map((p, i) => (
                            <line key={i} x1={padding} y1={height - (p * (height - padding * 2) + padding)} x2={width - padding} y2={height - (p * (height - padding * 2) + padding)} stroke="#F9FAFB" strokeWidth="2" />
                        ))}

                        {displayCount > 0 && (
                            <>
                                <path
                                    d={`${getPath()} L ${((displayCount - 1) * (width - padding * 2)) / (11) + padding},${height - padding} L ${padding},${height - padding} Z`}
                                    fill={`url(#gradient-${color})`}
                                    className="animate-fade-in"
                                />
                                <path d={getPath()} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[draw_1.5s_ease-out]" style={{ filter: `drop-shadow(0 6px 10px ${color}11)` }} />

                                {data.slice(0, displayCount).map((val, i) => {
                                    const x = (i * (width - padding * 2)) / (data.length - 1) + padding;
                                    const y = height - ((val / max) * (height - padding * 2) + padding);
                                    return (
                                        <g key={i} className="group/dot cursor-pointer">
                                            <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2.5" className="transition-all duration-300 group-hover/dot:r-6 group-hover/dot:stroke-width-3" />
                                            <rect x={x - 15} y={y - 30} width="30" height="18" rx="4" fill="#16120E" className="opacity-0 group-hover/dot:opacity-100 transition-opacity" />
                                            <text x={x} y={y - 18} textAnchor="middle" fill="white" className="text-[8px] font-black opacity-0 group-hover/dot:opacity-100 pointer-events-none">{val}</text>
                                        </g>
                                    );
                                })}
                            </>
                        )}
                    </svg>
                </div>
            </div>

            <div className="flex justify-between mt-6 ml-12 mr-2">
                {months.map((m, i) => (
                    <span key={i} className={`text-[8px] font-black uppercase tracking-[0.2em] ${i === currentMonth && year === currentYear ? 'text-[#E8430A]' : 'text-gray-300'}`}>{m}</span>
                ))}
            </div>
        </div>
    );
};

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<number[]>(new Array(12).fill(0));
    const [postData, setPostData] = useState<number[]>(new Array(12).fill(0));
    const [selectedYear, setSelectedYear] = useState(2025);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [uRes, pRes] = await Promise.all([
                axios.get(`${API_BASE}/users`),
                axios.get(`${API_BASE}/posts?limit=5000&status=ALL`)
            ]);
            const users = uRes.data.data || uRes.data || [];
            const posts = pRes.data.data || [];

            const processYearly = (items: any[]) => {
                const monthsData = new Array(12).fill(0);
                items.forEach(item => {
                    const date = new Date(item.createdAt);
                    if (date.getFullYear() === selectedYear) {
                        monthsData[date.getMonth()]++;
                    }
                });
                return monthsData;
            };

            setUserData(processYearly(users));
            setPostData(processYearly(posts));
        } catch (err) {
            console.error("Analitika yuklashda xato:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-[#16120E]">
            <AdminSidebar className="w-[280px] hidden lg:flex sticky top-0 h-screen" />

            <main className="flex-1 p-5 lg:p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div className="animate-fade-up">
                            <h1 className="font-serif text-xl md:text-2xl font-black tracking-tight mb-1">Analytics</h1>
                            <p className="text-gray-400 font-bold text-[8px] tracking-widest uppercase">Yillik o'sish va faollik tahlili</p>
                        </div>

                        <div className="animate-fade-up [animation-delay:100ms] flex items-center gap-3">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Selected Year:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-[9px] font-black outline-none focus:border-[#E8430A] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors uppercase tracking-widest"
                            >
                                {[2025, 2026, 2027, 2028].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E8430A] border-t-transparent" />
                        </div>
                    ) : (
                        <div className="grid gap-8 animate-fade-up [animation-delay:200ms]">
                            <Chart data={userData} color="#E8430A" title="Yillik Foydalanuvchilar" label="User Growth" year={selectedYear} />
                            <Chart data={postData} color="#3B82F6" title="Yillik Maqolalar" label="Content Activity" year={selectedYear} />
                        </div>
                    )}
                </div>

                <button onClick={() => setMobileMenuOpen(true)} className="fixed bottom-6 right-6 lg:hidden w-12 h-12 rounded-full bg-[#0A0908] text-white flex items-center justify-center shadow-xl z-40 transition-transform active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
            </main>
        </div>
    );
}
