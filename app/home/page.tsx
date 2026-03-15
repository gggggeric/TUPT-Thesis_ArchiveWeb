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
    FaChartLine,
    FaSave
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
    const [selectedAiItem, setSelectedAiItem] = useState<AiHistoryItem | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [clearAllModalOpen, setClearAllModalOpen] = useState(false);

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

    const confirmClearAllAiHistory = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAiHistory([]);
            } else {
                alert('Failed to clear history');
            }
        } catch (err) {
            console.error('Error clearing AI history:', err);
            alert('An error occurred while clearing history.');
        } finally {
            setClearAllModalOpen(false);
        }
    };

    const handleSavePrompt = () => {
        if (!selectedAiItem) return;

        // Create a blob and download it as a .txt file
        const blob = new Blob([`Original Search Query: ${selectedAiItem.prompt}\n\nAI Recommended Structure:\n\n${selectedAiItem.recommendation}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AI_Thesis_Recommendation_${selectedAiItem.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex items-center justify-between group hover:border-red-200 hover:shadow-2xl transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Archive Size</p>
                                <p className="text-4xl font-black text-gray-900 leading-none tracking-tighter">{thesisCount.toLocaleString()}</p>
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.1em] mt-3">Theses Indexed</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 group-hover:bg-[#8b0000] group-hover:border-[#8b0000] transition-all duration-500">
                                <FaSearch className="text-2xl text-red-400 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>

                        {/* AI History Count Card */}
                        <motion.div
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex items-center justify-between group hover:border-purple-200 hover:shadow-2xl transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">AI History</p>
                                <p className="text-4xl font-black text-gray-900 leading-none tracking-tighter">{aiHistory.length}</p>
                                <p className="text-[10px] text-purple-500 font-black uppercase tracking-[0.1em] mt-3">Recommendations</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 group-hover:border-purple-600 transition-all duration-500">
                                <FaRobot className="text-2xl text-purple-400 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>

                        {/* Recent Activity Count Card */}
                        <motion.div
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex items-center justify-between group hover:border-orange-200 hover:shadow-2xl transition-all duration-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Recently Viewed</p>
                                <p className="text-4xl font-black text-gray-900 leading-none tracking-tighter">{recentTheses.length}</p>
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.1em] mt-3">Active Items</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-500">
                                <FaHistory className="text-2xl text-orange-400 group-hover:text-white transition-all duration-500" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-12 mb-24">
                        {/* Main History Area */}
                        <div className="w-full space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase flex items-center gap-4">
                                    <span className="w-2 h-7 bg-[#fecaca] rounded-full" />
                                    AI Recommendation Log
                                </h2>
                                <div className="flex items-center gap-3">
                                    {aiHistory.length > 0 && (
                                        <button 
                                            onClick={() => setClearAllModalOpen(true)}
                                            className="text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-white bg-red-900/40 hover:bg-red-900/60 px-4 py-1.5 rounded-full border border-red-800/50 transition-colors"
                                        >
                                            Clear History
                                        </button>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 bg-blue-900/40 px-4 py-1.5 rounded-full border border-blue-800/50 flex items-center gap-2">
                                        <FaBrain /> AI Powered
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                                {loadingAi ? (
                                    <div className="p-12 text-center text-gray-400 text-sm font-medium">Loading AI history...</div>
                                ) : aiHistory.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {aiHistory.slice(0, 5).map((item) => {
                                            return (
                                                <div key={item._id} className="p-8 hover:bg-gray-50 transition-colors group relative">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                        <div className="flex-1 w-full">
                                                            <div
                                                                className="flex items-center gap-3 mb-2 cursor-pointer group/title"
                                                                onClick={() => setSelectedAiItem(item)}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-400 group-hover/title:bg-blue-50 group-hover/title:text-blue-500`}>
                                                                    <FaRobot />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-sm font-black text-gray-900 tracking-tight group-hover/title:text-blue-600 transition-colors flex items-center gap-2">
                                                                        {item.prompt.length > 50 ? item.prompt.substring(0, 50) + '...' : item.prompt}
                                                                        <span className="text-gray-400 text-[10px] ml-1">
                                                                            <FaArrowRight className="opacity-0 group-hover/title:opacity-100 transition-opacity translate-x-0 group-hover/title:translate-x-1" />
                                                                        </span>
                                                                    </h3>
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
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

                        {/* Secondary Stats Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recently Viewed */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                        Recent Views
                                    </h2>
                                    {recentTheses.length > 0 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="text-[10px] font-black uppercase tracking-widest text-orange-300 hover:text-white bg-orange-900/40 hover:bg-orange-900/60 px-4 py-1.5 rounded-full border border-orange-800/50 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-gray-900 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10 space-y-6">
                                        {recentTheses.length > 0 ? (
                                            recentTheses.slice(0, 3).map((thesis) => (
                                                <div
                                                    key={thesis.id}
                                                    className="group/item cursor-pointer"
                                                    onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                                >
                                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-1">{thesis.year || 'No Year'}</p>
                                                    <h3 className="text-[13px] font-bold leading-tight line-clamp-2 group-hover/item:text-red-700 transition-colors">{thesis.title}</h3>
                                                    <div className="w-6 h-0.5 bg-gray-200 mt-3 group-hover/item:w-full group-hover/item:bg-red-200 transition-all duration-500" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center">
                                                <p className="text-[10px] font-bold text-gray-400">No history found</p>
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
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-6">
                                    <div className="space-y-4">
                                        {deptCounts.slice(0, 5).map((dept, idx) => (
                                            <div
                                                key={dept.category + idx}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                                                onClick={() => router.push(`/search_result?category=${encodeURIComponent(dept.category)}`)}
                                            >
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">{dept.category}</span>
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

            {/* Clear All Confirmation Modal */}
            {
                clearAllModalOpen && (
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
                                <h3 className="text-xl font-black text-gray-900 mb-2">Clear All History?</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8">
                                    Are you sure you want to permanently clear all your AI title recommendations? This action cannot be undone.
                                </p>

                                <div className="flex w-full gap-3">
                                    <button
                                        onClick={() => setClearAllModalOpen(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmClearAllAiHistory}
                                        className="flex-1 bg-[#8b0000] hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            {/* AI Recommendation Modal */}
            {selectedAiItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <button
                            onClick={() => setSelectedAiItem(null)}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-8 flex-shrink-0 relative z-10">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                                <FaRobot className="text-red-500 text-3xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">AI Title Recommendation</h3>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Tailored to: "{selectedAiItem.prompt}"</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8 shadow-inner overflow-y-auto flex-grow relative z-10 custom-scrollbar">
                            <div className="text-[15px] text-gray-800 font-medium leading-[1.8]">
                                {selectedAiItem.recommendation.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className="min-h-[1.5em] mb-1">
                                        {line.replace(/^\s*\*\s/, '• ').replace(/^\s*-\s/, '• ').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i} className="font-black text-gray-900 text-[16px]">{part.slice(2, -2)}</strong>;
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end flex-shrink-0 relative z-10">
                            <button
                                onClick={handleSavePrompt}
                                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black tracking-wide uppercase transition-all shadow-lg hover:shadow-xl active:scale-95 bg-[#8b0000] text-white hover:bg-red-800"
                            >
                                <FaSave className="text-white text-lg" />
                                Save Prompt to File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default HomePage;
