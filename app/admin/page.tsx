'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomHeader from '@/components/Navigation/CustomHeader';
import { FaUserShield, FaChartBar, FaFileAlt, FaUsers, FaArrowRight, FaClock, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminPage() {
    const router = useRouter();
    const [adminData, setAdminData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        theses: 0,
        users: 0,
        pending: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userDataString || !token) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userDataString);
        if (!userData.isAdmin) {
            router.push('/home');
            return;
        }

        setAdminData(userData);

        const fetchDashboardData = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch Stats
                const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    if (statsData.success) {
                        setStats(statsData.data);
                        if (statsData.data.chartData) {
                            setChartData(statsData.data.chartData);
                        }
                    }
                }

                // Fetch Recent Activity (last 5 theses)
                const thesesRes = await fetch(`${API_BASE_URL}/admin/theses`, { headers });
                if (thesesRes.ok) {
                    const thesesData = await thesesRes.json();
                    if (thesesData.success) {
                        setRecentActivity(thesesData.data.slice(0, 5));
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b0000]"></div>
            </div>
        );
    }

    const statsCards = [
        { label: 'Total Theses', value: stats.theses.toLocaleString(), icon: <FaFileAlt className="text-blue-500" /> },
        { label: 'Total Users', value: stats.users.toLocaleString(), icon: <FaUsers className="text-green-500" /> },
        { label: 'Pending Approvals', value: stats.pending.toLocaleString(), icon: <FaChartBar className="text-amber-500" /> },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900 selection:bg-[#8b0000] selection:text-white">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader isLanding={false} />

            <main className="flex-1 relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 mb-10 border border-gray-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                    
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 bg-[#8b0000] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform duration-500">
                            <FaUserShield className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Admin Dashboard</h1>
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                                Welcome back, <span className="text-[#8b0000]">{adminData?.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100 shadow-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            System Online
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {statsCards.map((stat, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.push(stat.label === 'Total Users' ? '/admin/users' : '/admin/theses')}
                            className="bg-white/90 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/30 pointer-events-none" />
                            <div className="relative z-10 flex items-center justify-between mb-6">
                                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-red-50 transition-colors">
                                    <span className="text-2xl">{stat.icon}</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${stat.label === 'Pending Approvals' && stats.pending > 0 
                                    ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                    : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {stat.label === 'Pending Approvals' && stats.pending > 0 ? 'Action Required' : 'Optimal'}
                                </span>
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{stat.value}</h3>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Chart */}
                <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-gray-100 p-10 mb-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Growth Analytics</h2>
                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Platform activity metrics</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#8b0000]"></span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Theses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Users</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#adb5bd' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#adb5bd' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '1.5rem',
                                        border: '1px solid #f1f3f5',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="theses"
                                    stroke="#8b0000"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#8b0000', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 7, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-black text-gray-900 tracking-tight">Recent Activity</h2>
                            <button className="text-[#8b0000] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                Full View <FaArrowRight className="text-[10px]" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 flex-1">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((thesis: any) => (
                                    <div key={thesis._id} className="flex items-center gap-5 p-4 hover:bg-gray-50/80 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-gray-100 hover:shadow-sm">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#8b0000] transition-all duration-300">
                                            <FaFileAlt className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-gray-800 line-clamp-1 group-hover:text-[#8b0000] transition-colors">{thesis.title}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${thesis.isApproved ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {thesis.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                                <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                    <FaClock className="text-[8px]" /> {new Date(thesis.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 py-12">
                                    <FaFileAlt className="text-5xl mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue is empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="font-black text-gray-900 tracking-tight">Governance</h2>
                        </div>
                        <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="p-8 bg-gray-50 hover:bg-[#8b0000] rounded-[2rem] border border-gray-100 transition-all text-left flex flex-col gap-4 group hover:shadow-2xl hover:-translate-y-1 shadow-red-900/20"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                                    <FaUsers className="text-xl text-gray-400 group-hover:text-white" />
                                </div>
                                <div>
                                    <span className="block text-sm font-black text-gray-800 group-hover:text-white transition-colors">Users</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Access Control</span>
                                </div>
                            </button>
                            <button
                                onClick={() => router.push('/admin/theses')}
                                className="p-8 bg-gray-50 hover:bg-[#3b82f6] rounded-[2rem] border border-gray-100 transition-all text-left flex flex-col gap-4 group hover:shadow-2xl hover:-translate-y-1 shadow-blue-900/20"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                                    <FaFileAlt className="text-xl text-gray-400 group-hover:text-white" />
                                </div>
                                <div>
                                    <span className="block text-sm font-black text-gray-800 group-hover:text-white transition-colors">Archives</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white/60 transition-colors">Thesis Moderation</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
