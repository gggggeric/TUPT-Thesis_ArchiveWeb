'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FaSearch,
    FaArrowRight,
    FaHistory,
    FaFolderOpen,
    FaGraduationCap,
    FaChevronDown,
    FaChevronUp,
    FaTrash,
    FaRobot,
    FaBrain,
    FaTimes,
    FaQuestionCircle,
    FaFileUpload,
    FaChartLine
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import API_BASE_URL from '@/lib/api';

/* ───── Shared animation variants (portfolio style) ───── */
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
};

const fadeUpTransition: any = {
    duration: 0.7,
    ease: [0.22, 1, 0.36, 1],
};

/* ───── Types ───── */
interface Thesis {
    id: string;
    title: string;
    abstract: string;
    filename: string;
    category?: string;
    year_range?: string;
    author?: string;
}

interface SearchResult extends Thesis {
    score: number;
    relevance: string;
}

interface UserData {
    name?: string;
    idNumber?: string;
    [key: string]: unknown;
}

interface AiHistoryItem {
    _id: string;
    prompt: string;
    recommendation: string;
    createdAt: string;
}

/* ───── Component ───── */
const HomePage: React.FC = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [thesisCount, setThesisCount] = useState<number>(0);
    const [recentTheses, setRecentTheses] = useState<any[]>([]);
    const [deptCounts, setDeptCounts] = useState<{ category: string, count: number }[]>([]);
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

    // AI History
    const [aiHistory, setAiHistory] = useState<AiHistoryItem[]>([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [expandedAiItems, setExpandedAiItems] = useState<Record<string, boolean>>({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        const recent = JSON.parse(localStorage.getItem('recent_theses') || '[]');
        setRecentTheses(recent);

        if (userData && token) {
            setUser(JSON.parse(userData));

            const fetchCount = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/thesis/count`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setThesisCount(data.count);
                    }

                    const deptRes = await fetch(`${API_BASE_URL}/thesis/department-counts`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (deptRes.ok) {
                        const deptData = await deptRes.json();
                        setDeptCounts(deptData);
                    }
                } catch (err) {
                    console.error('Error fetching data:', err);
                }
            };
            fetchCount();

            const fetchAiHistory = async () => {
                setLoadingAi(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAiHistory(data.data || []);
                    }
                } catch (err) {
                    console.error('Error fetching AI history:', err);
                } finally {
                    setLoadingAi(false);
                }
            };
            fetchAiHistory();
        } else {
            router.push('/login');
        }
    }, [router]);

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const onSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search_result?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('recent_theses');
        setRecentTheses([]);
    };

    const handleDeleteAiHistory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDeleteAiHistory = async () => {
        if (!itemToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/ai-history/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAiHistory(prev => prev.filter(item => item._id !== itemToDelete));
            } else {
                alert('Failed to delete history item');
            }
        } catch (err) {
            console.error('Error deleting AI history:', err);
            alert('An error occurred while deleting.');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const toggleAiItem = (id: string) => {
        setExpandedAiItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            {/* Header */}
            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
                onSearch={onSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center relative pt-28">
                {/* Content Container */}
                <div className="max-w-6xl w-full flex flex-col px-6 relative z-10">

                    {/* Welcome Header */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-[10px] text-[#fecaca] font-black uppercase tracking-[0.25em] mb-2">{getGreeting()}</p>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome back, {user?.name || 'Researcher'}
                            </h1>
                            <p className="text-sm text-white/60 font-medium mt-2">Manage your research and explore the thesis collection.</p>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {/* Archive Size Card */}
                        <motion.div
                            className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl shadow-black/20 border border-white/10 flex items-center justify-between group hover:border-[#fecaca]/30 transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Archive Size</p>
                                <p className="text-4xl font-black text-white leading-none tracking-tighter">{thesisCount.toLocaleString()}</p>
                                <p className="text-[10px] text-[#fecaca] font-black uppercase tracking-[0.1em] mt-3">Theses Indexed</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#8b0000] group-hover:border-[#8b0000] transition-all duration-500">
                                <FaSearch className="text-2xl text-white/80 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>

                        {/* AI History Count Card */}
                        <motion.div
                            className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl shadow-black/20 border border-white/10 flex items-center justify-between group hover:border-purple-300/30 transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">AI History</p>
                                <p className="text-4xl font-black text-white leading-none tracking-tighter">{aiHistory.length}</p>
                                <p className="text-[10px] text-purple-300 font-black uppercase tracking-[0.1em] mt-3">Recommendations</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 group-hover:border-purple-600 transition-all duration-500">
                                <FaRobot className="text-2xl text-purple-300 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>

                        {/* Recent Activity Count Card */}
                        <motion.div
                            className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl shadow-black/20 border border-white/10 flex items-center justify-between group hover:border-orange-300/30 transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Recently Viewed</p>
                                <p className="text-4xl font-black text-white leading-none tracking-tighter">{recentTheses.length}</p>
                                <p className="text-[10px] text-orange-300 font-black uppercase tracking-[0.1em] mt-3">Active Items</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-600 group-hover:border-orange-600 transition-all duration-500">
                                <FaHistory className="text-2xl text-orange-300 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
                        {/* Main History Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase flex items-center gap-4">
                                    <span className="w-2 h-7 bg-[#fecaca] rounded-full" />
                                    AI Recommendation Log
                                </h2>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 bg-blue-900/40 px-4 py-1.5 rounded-full border border-blue-800/50 flex items-center gap-2">
                                    <FaBrain /> AI Powered
                                </span>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
                                {loadingAi ? (
                                    <div className="p-12 text-center text-gray-400 text-sm font-medium">Loading AI history...</div>
                                ) : aiHistory.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {aiHistory.slice(0, 5).map((item) => {
                                            const isExpanded = !!expandedAiItems[item._id];
                                            return (
                                                <div key={item._id} className="p-8 hover:bg-gray-50 transition-colors group relative">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                        <div className="flex-1 w-full">
                                                            <div
                                                                className="flex items-center gap-3 mb-2 cursor-pointer group/title"
                                                                onClick={() => toggleAiItem(item._id)}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover/title:bg-blue-50 group-hover/title:text-blue-500'}`}>
                                                                    <FaRobot />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-sm font-black text-gray-800 tracking-tight group-hover/title:text-blue-600 transition-colors flex items-center gap-2">
                                                                        {item.prompt.length > 50 ? item.prompt.substring(0, 50) + '...' : item.prompt}
                                                                        <span className="text-gray-400 text-[10px]">
                                                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                                        </span>
                                                                    </h3>
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-inner whitespace-pre-wrap text-[13px] text-white/80 font-medium leading-relaxed ml-11">
                                                                    {item.recommendation}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-shrink-0 flex items-start pt-1">
                                                            <button
                                                                onClick={(e) => handleDeleteAiHistory(item._id, e)}
                                                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"
                                                                title="Delete History"
                                                            >
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {aiHistory.length > 5 && (
                                            <div className="p-4 bg-gray-50/50 text-center">
                                                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#8b0000] transition-colors">
                                                    View All History
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                            <FaRobot className="text-blue-200 text-2xl" />
                                        </div>
                                        <p className="text-gray-400 font-medium text-sm">No AI title recommendations found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Recently Viewed */}
                            <div>
                                <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center gap-3 mb-6">
                                    <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                    Recent Views
                                </h2>
                                <div className="bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-[2rem] p-8 shadow-2xl border border-white/10 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10 space-y-6">
                                        {recentTheses.length > 0 ? (
                                            recentTheses.slice(0, 3).map((thesis) => (
                                                <div
                                                    key={thesis.id}
                                                    className="group/item cursor-pointer"
                                                    onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                                >
                                                    <p className="text-[9px] text-[#fecaca] font-black uppercase tracking-widest mb-1">{thesis.year || 'No Year'}</p>
                                                    <h3 className="text-[13px] font-bold leading-tight line-clamp-2 group-hover/item:text-[#fecaca] transition-colors">{thesis.title}</h3>
                                                    <div className="w-6 h-0.5 bg-white/10 mt-3 group-hover/item:w-full transition-all duration-500" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center">
                                                <p className="text-[10px] font-bold text-white/30">No history found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Departments Breakdown */}
                            <div>
                                <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center gap-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#fecaca] rounded-full" />
                                    Archive Stats
                                </h2>
                                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20 p-6">
                                    <div className="space-y-4">
                                        {deptCounts.slice(0, 5).map((dept, idx) => (
                                            <div
                                                key={dept.category + idx}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => router.push(`/search_result?category=${encodeURIComponent(dept.category)}`)}
                                            >
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-[#8b0000] transition-colors">{dept.category}</span>
                                                <span className="text-sm font-black text-gray-900">{dept.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Delete Confirmation Modal */}
            {
                deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                        <motion.div
                            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full pointer-events-none -z-0" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <FaTrash className="text-red-500 text-2xl" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Delete Recommendation?</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8">
                                    Are you sure you want to permanently delete this AI title recommendation? This action cannot be undone.
                                </p>

                                <div className="flex w-full gap-3">
                                    <button
                                        onClick={() => {
                                            setDeleteModalOpen(false);
                                            setItemToDelete(null);
                                        }}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAiHistory}
                                        className="flex-1 bg-[#8b0000] hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default HomePage;
