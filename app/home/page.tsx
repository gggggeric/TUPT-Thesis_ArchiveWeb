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
    FaSave,
    FaBookOpen,
    FaChevronRight
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import Sidebar from '@/components/Navigation/Sidebar';
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

interface LocalHistoryItem {
    _id: string;
    searchQuery: string;
    similarityScore: number;
    matchedTitle?: string;
    matchedId?: string;
    recommendation: string;
    createdAt: string;
}

/* ───── Component ───── */
const HomePage: React.FC = () => {
    const router = useRouter();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [thesisCount, setThesisCount] = useState<number>(0);
    const [recentTheses, setRecentTheses] = useState<any[]>([]);
    const [deptCounts, setDeptCounts] = useState<{ category: string, count: number }[]>([]);

    // AI History
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiHistory, setAiHistory] = useState<AiHistoryItem[]>([]);
    const [localHistory, setLocalHistory] = useState<LocalHistoryItem[]>([]);
    const [selectedAiItem, setSelectedAiItem] = useState<{ prompt: string; recommendation: string; similarity?: number; match?: string } | null>(null);
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
                    const [aiRes, localRes] = await Promise.all([
                        fetch(`${API_BASE_URL}/user/ai-history`, { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(`${API_BASE_URL}/user/local-history`, { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);

                    if (aiRes.ok) {
                        const aiData = await aiRes.json();
                        setAiHistory(aiData.data || []);
                    }
                    if (localRes.ok) {
                        const localData = await localRes.json();
                        setLocalHistory(localData.data || []);
                    }
                } catch (err) {
                    console.error('Error fetching history:', err);
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
        
        const isLocal = localHistory.find(h => h._id === itemToDelete);
        const endpoint = isLocal ? `/user/local-history/${itemToDelete}` : `/user/ai-history/${itemToDelete}`;

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (isLocal) {
                    setLocalHistory(prev => prev.filter(item => item._id !== itemToDelete));
                } else {
                    setAiHistory(prev => prev.filter(item => item._id !== itemToDelete));
                }
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
        <div className="min-h-screen bg-transparent flex font-sans text-white">
            <Sidebar 
                isExpanded={sidebarExpanded} 
                onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
            />

            <div className={`flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarExpanded ? 'pl-[280px]' : 'pl-[80px]'}`}>
                <CustomHeader
                    onMenuPress={() => setSidebarExpanded(!sidebarExpanded)}
                    onSearch={onSearch}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <main className="flex-grow flex flex-col items-center relative pt-28 pb-20">
                <div className="max-w-6xl w-full flex flex-col px-6 relative z-10">

                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-[0.35em] mb-4">{getGreeting()}</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                Welcome back, <span className="text-primary">{user?.name || 'Researcher'}</span>
                            </h1>
                            <p className="text-sm text-white/50 font-medium mt-4 max-w-2xl leading-relaxed">
                                Access your institutional repository, manage active research projects, and leverage AI-assisted document analysis tools.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        <motion.div
                            className="bg-card rounded-2xl p-7 shadow-lg border border-border-custom flex items-center justify-between group hover:border-primary/40 hover:bg-card/60 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Archive Size</p>
                                <p className="text-3xl font-bold text-foreground leading-none tracking-tighter">{thesisCount.toLocaleString()}</p>
                                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-[0.1em] mt-3">Theses Indexed</p>
                            </div>
                            <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20 group-hover:bg-primary/10 transition-colors">
                                <FaSearch className="text-xl text-primary" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-card rounded-2xl p-7 shadow-lg border border-border-custom flex items-center justify-between group hover:border-purple-400/40 hover:bg-card/60 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                             <div>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Research Insights</p>
                                 <p className="text-3xl font-bold text-foreground leading-none tracking-tighter">{aiHistory.length + localHistory.length}</p>
                                 <p className="text-[10px] text-purple-400/70 font-bold uppercase tracking-[0.1em] mt-3">Analyses Generated</p>
                             </div>
                            <div className="w-14 h-14 rounded-xl bg-purple-500/5 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/10 transition-colors">
                                <FaRobot className="text-xl text-purple-400" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-card rounded-2xl p-7 shadow-lg border border-border-custom flex items-center justify-between group hover:border-orange-400/40 hover:bg-card/60 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Recently Viewed</p>
                                <p className="text-3xl font-bold text-foreground leading-none tracking-tighter">{recentTheses.length}</p>
                                <p className="text-[10px] text-orange-400/70 font-bold uppercase tracking-[0.1em] mt-3">Active Session</p>
                            </div>
                            <div className="w-14 h-14 rounded-xl bg-orange-500/5 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/10 transition-colors">
                                <FaHistory className="text-xl text-orange-400" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-16">
                        <div className="w-full space-y-6">
                            <div className="flex items-center justify-between">
                                 <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
                                     <span className="w-1 h-5 bg-primary rounded-full" />
                                     Research Insight Log
                                 </h2>
                                <div className="flex items-center gap-4">
                                    {(aiHistory.length > 0 || localHistory.length > 0) && (
                                        <button 
                                            onClick={() => setClearAllModalOpen(true)}
                                            className="text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                                        >
                                            Purge Log
                                        </button>
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/70 bg-blue-900/20 px-4 py-1.5 rounded-lg border border-blue-800/30 flex items-center gap-2">
                                        <FaBrain className="text-[10px]" /> Intelligence Enabled
                                    </span>
                                </div>
                            </div>

                            <div className="bg-card rounded-2xl border border-border-custom shadow-xl overflow-hidden backdrop-blur-md">
                                {loadingAi ? (
                                    <div className="p-16 text-center text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Initialising Secure Log...</div>
                                ) : (aiHistory.length > 0 || localHistory.length > 0) ? (
                                    <div className="divide-y divide-white/[0.03]">
                                        {[
                                            ...aiHistory.map(h => ({ ...h, type: 'ai' })),
                                            ...localHistory.map(h => ({ ...h, type: 'local', prompt: h.searchQuery }))
                                        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((item: any) => {
                                            return (
                                                <div key={item._id} className="p-5 hover:bg-primary/[0.02] transition-all group relative border-l-2 border-transparent hover:border-primary">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1 min-w-0">
                                                            <div
                                                                className="flex items-center gap-6 cursor-pointer"
                                                                onClick={() => setSelectedAiItem({
                                                                    prompt: item.prompt,
                                                                    recommendation: item.recommendation,
                                                                    similarity: item.similarityScore,
                                                                    match: item.matchedTitle
                                                                })}
                                                            >
                                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${item.type === 'local' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-800/50 text-gray-500 border border-white/[0.03]'} group-hover:scale-105`}>
                                                                    {item.type === 'local' ? <FaBookOpen className="text-sm" /> : <FaRobot className="text-sm" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <h3 className="text-[14px] font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                                                                            {item.prompt}
                                                                        </h3>
                                                                        {item.type === 'local' && (
                                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase ${item.similarityScore > 40 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                                                {item.similarityScore}% Match
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                                                            {item.type === 'local' ? 'Archive Audit' : 'AI Optimization'}
                                                                        </span>
                                                                        <span className="text-white/10">•</span>
                                                                        <span className="text-[9px] text-gray-500 font-medium tracking-wide">
                                                                            {new Date(item.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={(e) => handleDeleteAiHistory(item._id, e)}
                                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-400/5 transition-all"
                                                                title="Purge Entry"
                                                            >
                                                                <FaTrash className="text-[10px]" />
                                                            </button>
                                                            <FaChevronRight className="text-gray-700 text-[10px] group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(aiHistory.length + localHistory.length) > 5 && (
                                            <div className="p-4 bg-white/[0.01] text-center border-t border-white/[0.03]">
                                                <button className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] hover:text-primary transition-colors">
                                                    Open Dimensional Audit Log
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-white/[0.02] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.03]">
                                            <FaBrain className="text-gray-800 text-2xl" />
                                        </div>
                                        <p className="text-gray-600 font-bold text-[10px] uppercase tracking-[0.3em]">Log sequence empty</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4">
                                        <span className="w-0.5 h-4 bg-orange-400/40" />
                                        Session History
                                    </h2>
                                    {recentTheses.length > 0 && (
                                        <button 
                                            onClick={clearHistory}
                                            className="text-[9px] font-bold uppercase tracking-widest text-orange-400/40 hover:text-orange-400 transition-colors"
                                        >
                                            Clear Manifest
                                        </button>
                                    )}
                                </div>
                                <div className="bg-card rounded-2xl p-7 shadow-xl border border-border-custom relative overflow-hidden flex-grow">
                                    <div className="relative z-10 space-y-5">
                                        {recentTheses.length > 0 ? (
                                            recentTheses.slice(0, 3).map((thesis) => (
                                                <div
                                                    key={thesis.id}
                                                    className="group/item cursor-pointer flex items-start gap-4 transition-all"
                                                    onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                                >
                                                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400/20 group-hover/item:bg-orange-400 group-hover/item:scale-125 transition-all" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">{thesis.year || 'Archive'}</p>
                                                        <h3 className="text-[13px] font-medium leading-relaxed text-foreground/70 group-hover/item:text-foreground transition-colors line-clamp-2">{thesis.title}</h3>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-24 flex flex-col items-center justify-center opacity-40">
                                                <FaHistory className="text-gray-800 text-xl mb-3" />
                                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">No recent entries</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h2 className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase flex items-center gap-4 mb-6">
                                    <span className="w-0.5 h-4 bg-primary/40" />
                                    Archive Analytics
                                </h2>
                                <div className="bg-card rounded-2xl border border-border-custom shadow-xl p-4 flex-grow">
                                    <div className="space-y-1.5">
                                        {deptCounts.slice(0, 5).map((dept, idx) => (
                                            <div
                                                key={dept.category + idx}
                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.01] transition-all cursor-pointer group border border-transparent hover:border-white/[0.03]"
                                                onClick={() => router.push(`/search_result?category=${encodeURIComponent(dept.category)}`)}
                                            >
                                                <span className="text-[11px] font-medium text-gray-500 group-hover:text-primary transition-colors tracking-wide">{dept.category}</span>
                                                <span className="text-[11px] font-bold text-foreground/60 group-hover:text-foreground">{dept.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-white/90">
                    <motion.div
                        className="bg-[#0f0f0f] rounded-2xl p-10 w-full max-w-md shadow-2xl border border-white/[0.05] relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.05]">
                                <FaTrash className="text-primary text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Purge Insight?</h3>
                            <p className="text-sm text-white/40 font-medium mb-10 leading-relaxed">
                                Are you sure you want to permanently remove this insight from the research log? This action cannot be reversed.
                            </p>

                            <div className="flex w-full gap-4">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest border border-white/[0.05]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteAiHistory}
                                    className="flex-1 bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all duration-300 hover:bg-primary/20"
                                >
                                    Confirm Purge
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {clearAllModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in text-white/90">
                    <motion.div
                        className="bg-[#0f0f0f] rounded-2xl p-10 w-full max-w-md shadow-2xl border border-white/[0.05] relative overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-6 border border-white/[0.05]">
                                <FaTrash className="text-primary text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Complete Purge?</h3>
                            <p className="text-sm text-white/40 font-medium mb-10 leading-relaxed">
                                You are about to wipe the entire research insight log. All dimensionality data and AI recommendations will be lost.
                            </p>

                            <div className="flex w-full gap-4">
                                <button
                                    onClick={() => setClearAllModalOpen(false)}
                                    className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] text-white/60 font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest border border-white/[0.05]"
                                >
                                    Retain Log
                                </button>
                                <button
                                    onClick={confirmClearAllAiHistory}
                                    className="flex-1 bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all duration-300 hover:bg-primary/20"
                                >
                                    Execute Purge
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {selectedAiItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0f0f0f] rounded-2xl p-8 md:p-14 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border border-white/[0.05] text-white/90">
                        <button
                            onClick={() => setSelectedAiItem(null)}
                            className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center bg-white/[0.03] hover:bg-primary/20 text-gray-500 hover:text-primary rounded-xl transition-all z-10 border border-white/[0.05]"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                        
                         <div className="flex items-center gap-6 mb-10 flex-shrink-0 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${selectedAiItem.similarity !== undefined ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                                {selectedAiItem.similarity !== undefined ? <FaBookOpen className="text-primary text-3xl" /> : <FaRobot className="text-primary text-3xl" />}
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-2">
                                    {selectedAiItem.similarity !== undefined ? 'Archive Dimensional Analysis' : 'Synthesis Optimization'}
                                </h3>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Target: "{selectedAiItem.prompt}"</p>
                            </div>
                        </div>

                        {selectedAiItem.similarity !== undefined && (
                            <div className="mb-8 bg-white/[0.02] rounded-xl p-6 border border-white/[0.03] animate-fade-in flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Similarity Metrics</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${selectedAiItem.similarity > 40 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                        {selectedAiItem.similarity}% Structural Match
                                    </span>
                                </div>
                                {selectedAiItem.match && (
                                    <p className="text-[12px] text-white/60 font-medium italic border-l-2 border-primary/30 pl-4 py-1">
                                        Matched Repository: "{selectedAiItem.match}"
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-8 md:p-10 shadow-inner overflow-y-auto flex-grow relative z-10 custom-scrollbar">
                            <div className="text-[15px] text-white/70 font-medium leading-relaxed">
                                {selectedAiItem.recommendation.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className="min-h-[1.5em] mb-2">
                                        {line.trim().startsWith('*') || line.trim().startsWith('-') ? (
                                            <span className="flex gap-3">
                                                <span className="text-primary mt-1">•</span>
                                                <span>
                                                    {line.replace(/^\s*[\*\-]\s*/, '').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                                                        }
                                                        return <span key={i}>{part}</span>;
                                                    })}
                                                </span>
                                            </span>
                                        ) : (
                                            line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                                                }
                                                return <span key={i}>{part}</span>;
                                            })
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-10 flex justify-end flex-shrink-0 relative z-10">
                            <button
                                onClick={handleSavePrompt}
                                className="flex items-center gap-3 px-10 py-4 rounded-xl text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 active:scale-95"
                            >
                                <FaSave className="text-lg" />
                                Export Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
