'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaChartBar, FaFileAlt, FaUsers, FaArrowRight, FaClock, FaPlus, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminDashboardSkeleton from '@/app/components/UI/skeleton_loaders/admin/AdminDashboardSkeleton';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const fadeUpTransition = {
    duration: 0.5,
    ease: "easeOut" as any,
};

export default function AdminPage() {
    const router = useRouter();
    const [adminData, setAdminData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [stats, setStats] = useState({
        theses: 0,
        users: 0,
        pending: 0,
        graduated: 0,
        collaborations: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => setShowSkeleton(true), 500);
        } else {
            setShowSkeleton(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userDataString || !token) {
            router.push('/auth/login');
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
        if (showSkeleton) return <AdminDashboardSkeleton />;
        return <div className="flex-1 min-h-screen" />; // Placeholder for first 500ms
    }

    const statsCards = [
        {
            label: 'Total Theses',
            value: stats.theses.toLocaleString(),
            icon: <FaFileAlt />,
            color: 'teal',
            desc: 'Theses Archived',
            path: '/admin/theses'
        },
        {
            label: 'Total Users',
            value: stats.users.toLocaleString(),
            icon: <FaUsers />,
            color: 'blue',
            desc: 'Registered Users',
            path: '/admin/users'
        },
        {
            label: 'Collab Requests',
            value: (stats.collaborations || 0).toLocaleString(),
            icon: <FaUsers />,
            color: 'indigo',
            desc: 'Joint Research',
            path: '/admin/theses'
        },
        {
            label: 'Action Required',
            value: stats.pending.toLocaleString(),
            icon: <FaExclamationCircle />,
            color: 'amber',
            desc: 'Pending Review',
            path: '/admin/theses'
        },
    ];

    return (
        <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full text-white">
            {/* Header Section */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={fadeUpTransition}
                className="mb-12"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-primary/20">Admin Panel</span>
                            <div className="h-px w-12 bg-white/10" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
                            System <span className="text-primary italic">Overview</span>
                        </h1>
                        <p className="text-white/40 text-sm font-medium max-w-xl leading-relaxed">
                            Welcome back, {adminData?.name}. Here's the overall system activity, database status, and user growth trends.
                        </p>
                    </div>

                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {statsCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        onClick={() => router.push(stat.path)}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ ...fadeUpTransition, delay: 0.1 * idx }}
                        className="bg-card rounded-2xl p-8 shadow-lg border border-border-custom flex items-center justify-between group hover:border-primary/40 hover:bg-card/60 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className="text-4xl font-bold text-foreground leading-none tracking-tighter mb-4">{stat.value}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${stat.color === 'amber' ? 'text-amber-400' : 'text-primary/70'}`}>
                                    {stat.desc}
                                </span>
                            </div>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl
                            ${stat.color === 'teal' ? 'bg-primary/5 border-primary/20 text-primary group-hover:bg-primary/20' :
                                stat.color === 'blue' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20' :
                                    stat.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20' :
                                        'bg-amber-500/5 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20'}`}>
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700
                            ${stat.color === 'teal' ? 'bg-primary' : stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ ...fadeUpTransition, delay: 0.4 }}
                    className="lg:col-span-3 space-y-10"
                >
                    {/* System Growth Chart */}
                    <div className="bg-card rounded-2xl border border-border-custom shadow-2xl overflow-hidden backdrop-blur-md">
                        <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                            <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
                                <span className="w-1 h-5 bg-primary rounded-full" />
                                System Growth
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Theses</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Users</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTheses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1E1E2E', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: '900', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Area type="monotone" dataKey="theses" stroke="#2DD4BF" strokeWidth={4} fillOpacity={1} fill="url(#colorTheses)" />
                                    <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Interaction Analytics Chart */}
                    <div className="bg-card rounded-2xl border border-border-custom shadow-2xl overflow-hidden backdrop-blur-md">
                        <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                            <h2 className="text-[10px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase flex items-center gap-4">
                                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                                Interaction Analytics
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Collabs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">AI Queries</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1E1E2E', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: '900', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Line type="monotone" dataKey="collaborations" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="history" stroke="#f97316" strokeWidth={4} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* Graduation Distribution Pie Chart */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ ...fadeUpTransition, delay: 0.5 }}
                    className="lg:col-span-1 bg-card rounded-2xl border border-border-custom shadow-2xl overflow-hidden backdrop-blur-md flex flex-col h-full"
                >
                    <div className="p-8 border-b border-white/[0.03]">
                        <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
                            <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                            Distribution
                        </h2>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[400px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Alumni', value: stats.graduated },
                                        { name: 'Students', value: Math.max(0, stats.users - stats.graduated) }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" opacity={0.3} />
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1E1E2E',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-8 space-y-4 w-full px-4">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span>Alumni</span>
                                </div>
                                <span className="text-white">{Math.round((stats.graduated / Math.max(1, stats.users)) * 100)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-50" />
                                    <span>Students</span>
                                </div>
                                <span className="text-white">{Math.round(((stats.users - stats.graduated) / Math.max(1, stats.users)) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ ...fadeUpTransition, delay: 0.6 }}
                    className="lg:col-span-3 space-y-10"
                >
                    {/* Recent Content */}
                    <div className="bg-card rounded-2xl border border-border-custom shadow-xl overflow-hidden backdrop-blur-md">
                        <div className="p-8 border-b border-white/[0.03] flex items-center justify-between">
                            <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
                                <span className="w-1 h-5 bg-amber-400/40 rounded-full" />
                                Recent Activity
                            </h2>
                            <button onClick={() => router.push('/admin/theses')} className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                                View All <FaArrowRight className="text-[9px]" />
                            </button>
                        </div>
                        <div className="divide-y divide-white/[0.03]">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((thesis: any) => (
                                    <div key={thesis._id} className="p-6 hover:bg-white/[0.02] transition-all group cursor-pointer" onClick={() => router.push('/admin/theses')}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                                <FaFileAlt className="text-sm" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate mb-1.5">{thesis.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border
                                                        ${thesis.isApproved ? 'bg-primary/5 text-primary border-primary/20' : 'bg-amber-500/5 text-amber-500 border-amber-500/20'}`}>
                                                        {thesis.isApproved ? 'Approved' : 'Pending'}
                                                    </span>
                                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <FaClock className="text-[9px]" /> {new Date(thesis.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <FaArrowRight className="text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center justify-center opacity-20">
                                    <FaFileAlt className="text-5xl mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No activity yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
