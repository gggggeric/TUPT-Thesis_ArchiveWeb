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
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <CustomHeader isLanding={false} />

            <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#8b0000]/10 rounded-2xl flex items-center justify-center">
                            <FaUserShield className="text-3xl text-[#8b0000]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-500 font-medium">Welcome back, <span className="text-[#8b0000]">{adminData?.name}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider border border-green-100">
                            System Online
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statsCards.map((stat, idx) => (
                        <div
                            key={idx}
                            onClick={() => router.push(stat.label === 'Total Users' ? '/admin/users' : '/admin/theses')}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    {stat.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${stat.label === 'Pending Approvals' && stats.pending > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                    {stat.label === 'Pending Approvals' && stats.pending > 0 ? 'Attention' : 'Optimal'}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Growth Analytics</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Last 6 Months Activity</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#8b0000]"></span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Theses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Users</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="theses"
                                    stroke="#8b0000"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#8b0000', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-black text-gray-900 tracking-tight">Recent Activity</h2>
                            <button className="text-[#8b0000] text-xs font-bold flex items-center gap-1 hover:underline">
                                View All <FaArrowRight className="text-[10px]" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((thesis: any) => (
                                    <div key={thesis._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#8b0000]/10 transition-colors">
                                            <FaFileAlt className="text-gray-400 group-hover:text-[#8b0000]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{thesis.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${thesis.isApproved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {thesis.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                                <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                                                    <FaClock className="text-[9px]" /> {new Date(thesis.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                    <FaFileAlt className="text-4xl mb-3 opacity-20" />
                                    <p className="text-sm font-bold">No recent thesis uploads found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="font-black text-gray-900 tracking-tight">Admin Controls</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="p-4 bg-gray-50 hover:bg-[#8b0000]/5 rounded-xl border border-gray-100 transition-all text-left flex flex-col gap-2 group"
                            >
                                <FaUsers className="text-gray-400 group-hover:text-[#8b0000]" />
                                <span className="text-sm font-bold text-gray-800">Manage Users</span>
                            </button>
                            <button
                                onClick={() => router.push('/admin/theses')}
                                className="p-4 bg-gray-50 hover:bg-[#8b0000]/5 rounded-xl border border-gray-100 transition-all text-left flex flex-col gap-2 group"
                            >
                                <FaFileAlt className="text-gray-400 group-hover:text-[#8b0000]" />
                                <span className="text-sm font-bold text-gray-800">Manage Theses</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
