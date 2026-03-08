'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaSearch,
    FaArrowRight,
    FaHistory,
    FaFolderOpen,
    FaGraduationCap,
    FaChevronDown,
    FaChevronUp,
    FaTrash
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import API_BASE_URL from '@/lib/api';

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
    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        const recent = JSON.parse(localStorage.getItem('recent_theses') || '[]');
        setRecentTheses(recent);

        if (userData && token) {
            setUser(JSON.parse(userData));

            // Fetch real thesis count from backend
            const fetchCount = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/thesis/count`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setThesisCount(data.count);
                    }

                    // Fetch Department Counts
                    const deptRes = await fetch(`${API_BASE_URL}/thesis/department-counts`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
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

    // Note: Search is now handled by the CustomHeader component which redirects to /search_result
    const onSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search_result?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('recent_theses');
        setRecentTheses([]);
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
                onSearch={onSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#8b0000]/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#8b0000]/5 rounded-full blur-[150px]" />

                <div className="max-w-6xl w-full flex flex-col gap-12 relative z-10 pt-20">
                    {/* Dashboard Cards Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-gray-100 flex items-center justify-between group hover:border-[#8b0000]/30 transition-all duration-500 h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b0000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Archive Size</p>
                                <p className="text-5xl font-black text-gray-900 leading-none tracking-tighter">{thesisCount.toLocaleString()}</p>
                                <p className="text-[11px] text-[#8b0000] font-black uppercase tracking-[0.1em] mt-3">Theses Indexed</p>
                            </div>
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-[#8b0000]/5 flex items-center justify-center border border-[#8b0000]/10 group-hover:bg-[#8b0000] group-hover:border-[#8b0000] transition-all duration-500">
                                <FaSearch className="text-3xl text-[#8b0000] group-hover:text-white transition-all duration-500" />
                            </div>
                        </div>

                        {/* Recently Viewed */}
                        <div className="bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-[2.5rem] p-10 shadow-2xl border border-white/10 text-white space-y-8 h-full relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10 flex items-center justify-between">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FaHistory className="text-[#fecaca] text-lg" /> Recently Viewed
                                </h2>
                                {recentTheses.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 hover:bg-white/40 hover:border-white/40 transition-all flex items-center gap-2 group/clear"
                                    >
                                        <FaTrash className="text-[8px] opacity-60 group-hover/clear:opacity-100 transition-opacity" />
                                        Clear History
                                    </button>
                                )}
                            </div>

                            {recentTheses.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTheses.map((thesis) => (
                                        <div
                                            key={thesis.id}
                                            className="group cursor-pointer"
                                            onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                        >
                                            <p className="text-[10px] text-[#fecaca] font-black uppercase tracking-widest mb-1">{thesis.year}</p>
                                            <h3 className="text-sm font-bold leading-tight line-clamp-1 group-hover:text-[#fecaca] transition-colors">{thesis.title}</h3>
                                            <div className="w-8 h-0.5 bg-white/10 mt-3 group-hover:w-full transition-all duration-500" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-xs font-bold text-white/40">No recent views yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Distributions */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                                <span className="w-2 h-7 bg-[#8b0000] rounded-full" />
                                Thesis Repository Breakdown
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b0000] bg-[#8b0000]/5 px-4 py-1.5 rounded-full border border-[#8b0000]/10">
                                Department Level
                            </span>
                        </div>

                        {deptCounts.length > 0 ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-500">
                                {/* The 'One Container' Header/Trigger */}
                                <button
                                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                                    className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-[#8b0000]/5 flex items-center justify-center border border-[#8b0000]/10 group-hover:bg-[#8b0000] transition-all duration-500">
                                            <FaFolderOpen className="text-2xl text-[#8b0000] group-hover:text-white transition-all duration-500" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Explore Departments</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                                                {deptCounts.filter(d => d.category.toUpperCase() !== 'UNCATEGORIZED').length} Academic Disciplines
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-500 ${isDeptDropdownOpen ? 'bg-[#8b0000] border-[#8b0000] text-white rotate-180' : 'bg-white text-gray-400'}`}>
                                        <FaChevronDown />
                                    </div>
                                </button>

                                {/* Dropdown Content */}
                                <div className={`transition-all duration-700 ease-in-out ${isDeptDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                    <div className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-50">
                                        {deptCounts
                                            .filter(dept => dept.category.toUpperCase() !== 'UNCATEGORIZED')
                                            .map((dept, index) => (
                                                <div
                                                    key={dept.category + index}
                                                    className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-transparent hover:border-[#8b0000]/20 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer group/item"
                                                    onClick={() => router.push(`/search_result?category=${encodeURIComponent(dept.category)}`)}
                                                >
                                                    <div>
                                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover/item:text-[#8b0000] transition-colors mb-1">{dept.category}</h4>
                                                        <div className="w-4 h-0.5 bg-[#8b0000]/20 rounded-full group-hover/item:w-full transition-all duration-500" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-gray-900 leading-none">{dept.count}</span>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Files</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white rounded-[2.5rem] border border-gray-100 italic text-gray-400 text-sm shadow-xl shadow-black/5">
                                Loading archive statistics...
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;
