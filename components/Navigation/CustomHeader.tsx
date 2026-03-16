'use client';

import { useState, useRef, useEffect, ReactElement } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    FaBars,
    FaSearch,
    FaTimes,
    FaFilter,
    FaFolder,
    FaCalendarAlt,
    FaFileAlt,
    FaSignOutAlt,
    FaRobot,
    FaMagic
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Thesis {
    id?: string;
    title?: string;
    abstract?: string;
    author?: string;
    filename?: string;
    year_range?: string;
    [key: string]: unknown;
}

interface SearchResult extends Thesis {
    score: number;
    relevance: string;
}

interface Filters {
    year: string;
    category: string;
    searchType: string;
}

interface ThesisData {
    theses?: Thesis[];
}

interface CustomHeaderProps {
    onMenuPress?: () => void;
    onSearch?: () => void;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    isLanding?: boolean;
}

const CustomHeader = ({
    onMenuPress = () => { },
    onSearch = () => { },
    searchQuery = '',
    onSearchChange = () => { },
    isLanding = false
}: CustomHeaderProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearch, setShowSearch] = useState(true);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const [filters, setFilters] = useState<Filters>({
        year: 'all',
        category: 'all',
        searchType: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const [years, setYears] = useState<string[]>(['all']);
    const [categories, setCategories] = useState<string[]>(['all']);
    const [loading, setLoading] = useState(false);

    // AI Recommendation states
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    useEffect(() => {
        const fetchFilters = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };

                // Fetch Years
                const yearsUrl = `${API_BASE_URL}/thesis/years`;
                const yearsRes = await fetch(yearsUrl, { headers });
                if (yearsRes.ok) {
                    const yearsData = await yearsRes.json();
                    if (Array.isArray(yearsData)) setYears(['all', ...yearsData]);
                } else if (yearsRes.status !== 401) {
                    console.error(`Failed to fetch years (${yearsRes.status}) from ${yearsUrl}`);
                }

                // Fetch Categories
                const catUrl = `${API_BASE_URL}/thesis/categories`;
                const catRes = await fetch(catUrl, { headers });
                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (Array.isArray(catData)) {
                        const uniqueCats = Array.from(new Set(['all', ...catData]));
                        setCategories(uniqueCats);
                    }
                } else if (catRes.status !== 401) {
                    console.error(`Failed to fetch categories (${catRes.status}) from ${catUrl}`);
                }
            } catch (err) {
                console.error('Error fetching filters:', err);
            }
        };
        fetchFilters();
    }, []);

    const performSearch = async () => {
        const query = localSearchQuery.trim();
        if (!query) { setSearchResults([]); return; }
        try {
            const token = localStorage.getItem('token');
            const url = new URL(`${API_BASE_URL}/thesis/search`);
            url.searchParams.append('query', query);
            if (filters.year !== 'all') url.searchParams.append('year', filters.year);
            if (filters.category !== 'all') url.searchParams.append('category', filters.category);
            if (filters.searchType !== 'all') url.searchParams.append('type', filters.searchType);

            const res = await fetch(url.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType || !contentType.includes("application/json")) {
                throw new Error(`Invalid search response: ${res.status}`);
            }
            const data = await res.json();

            const processedResults: SearchResult[] = data.map((thesis: Thesis) => ({
                ...thesis,
                score: 1,
                relevance: 'High'
            }));

            setSearchResults(processedResults);
            if (processedResults.length > 0) {
                setShowSearchResults(true);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };



    const highlightText = (text: string | undefined, query: string): ReactElement | string => {
        if (!text || !query) return text || '';
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return (
            <>
                {parts.map((part, index) =>
                    regex.test(part) ? <span key={index} className="text-[#2DD4BF] font-black">{part}</span> : part
                )}
            </>
        );
    };

    const triggerFullSearch = () => {
        const query = localSearchQuery.trim();
        if (query) {
            const params = new URLSearchParams();
            params.append('query', query);
            if (filters.year !== 'all') params.append('year', filters.year);
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.searchType !== 'all') params.append('type', filters.searchType);

            router.push(`/search_result?${params.toString()}`);
            setShowSearchResults(false);
            setShowFilters(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            triggerFullSearch();
            (e.target as HTMLInputElement).blur();
        }
    };

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchQuery.trim()) { performSearch(); }
            else { setSearchResults([]); setShowSearchResults(false); }
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localSearchQuery, filters]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 50);

            // Search Bar Visibility Logic
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down - Hide search
                setShowSearch(false);
            } else {
                // Scrolling up - Show search
                setShowSearch(true);
            }
            lastScrollY.current = currentScrollY;

            // Show search when scrolling stops
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setShowSearch(true);
            }, 800);
        };

        const checkAuth = () => {
            const userDataString = localStorage.getItem('userData');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setIsLoggedIn(true);
                setIsAdmin(!!userData.isAdmin);
            } else {
                setIsLoggedIn(false);
                setIsAdmin(false);
            }
            setMounted(true);
        };

        checkAuth();
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
                searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        if (localSearchQuery.trim()) setShowSearchResults(true);
    };

    const handleSearchBlur = () => {
        if (!localSearchQuery) setIsSearchFocused(false);
    };

    const clearSearch = () => {
        setLocalSearchQuery('');
        onSearchChange('');
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearchFocused(false);
        setAiRecommendation(null);
    };

    const handleRecommendByAi = async () => {
        if (!localSearchQuery.trim()) return;
        setIsLoadingAi(true);
        setAiRecommendation(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/thesis/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    prompt: `I am looking for theses related to "${localSearchQuery}". Based on this query, please recommend a better or more specific thesis title. Your response MUST include three distinct sections formatted exactly like this:\n\nFunctional Requirements:\n[Your text here]\n\nConclusion:\n[Your text here]\n\nRecommendations:\n[Your text here]`
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch AI recommendation: ${response.status}`);
            }

            const data = await response.json();
            setAiRecommendation(data.recommendation);

            // Save the history to the backend for the user
            if (token) {
                try {
                    await fetch(`${API_BASE_URL}/user/ai-history`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            prompt: localSearchQuery,
                            recommendation: data.recommendation
                        })
                    });
                } catch (saveError) {
                    console.error('Quietly failed to save AI history:', saveError);
                }
            }

        } catch (error) {
            console.error('Error getting AI recommendation:', error);
            toast.error('Failed to get AI recommendation. Please try again.');
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleLogout = () => {
        const userDataString = localStorage.getItem('userData');
        const userName = userDataString ? JSON.parse(userDataString).name : 'Admin';
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        toast.success(`Goodbye, ${userName}! You have been logged out successfully.`);
        router.push('/login');
    };

    const handleFilterChange = (filterType: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));

        // If we are on search_result page, we might want to update the URL immediately
        if (pathname === '/search_result') {
            const params = new URLSearchParams(window.location.search);
            params.set(filterType === 'searchType' ? 'type' : filterType, value);
            router.push(`/search_result?${params.toString()}`);
        } else if ((filterType === 'year' || filterType === 'category') && value !== 'all') {
            // Redirect to search_result page if year or category is filtered to a specific value from home
            const params = new URLSearchParams();
            if (filterType === 'year') params.append('year', value);
            if (filterType === 'category') params.append('category', value);
            router.push(`/search_result?${params.toString()}`);
            setShowFilters(false);
            setShowSearchResults(false);
        }
    };



    const isTransparentPage = isLanding;
    const isRedHeader = !isTransparentPage || scrolled;

    const headerBgClass = scrolled
        ? 'bg-black/20 backdrop-blur-xl shadow-2xl py-3'
        : 'bg-transparent py-6';

    const textClass = 'text-white drop-shadow-sm';
    const iconClass = 'text-white drop-shadow-sm';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex items-center justify-between px-6 ${headerBgClass}`}>
            {/* Left Section: Menu + Branding */}
            <div className="flex items-center gap-3 md:gap-4 z-10">
                {(mounted && !isLanding && isLoggedIn && !isAdmin) && (
                    <button
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 border-none cursor-pointer bg-card/10 text-white hover:bg-card/20`}
                        onClick={onMenuPress}
                        aria-label="Menu"
                    >
                        <FaBars />
                    </button>
                )}
                <div
                    className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 transform duration-200"
                    onClick={() => {
                        if (isLoggedIn) {
                            router.push(isAdmin ? '/admin' : '/home');
                        } else {
                            router.push('/');
                        }
                    }}
                    role="button"
                    aria-label="Go to Dashboard"
                >
                    <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300">
                        <img
                            src="/assets/tup-logo.png"
                            alt="TUP Logo"
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </div>
                    <span className={`text-base md:text-lg font-black tracking-tighter uppercase leading-none transition-colors duration-500 hidden sm:inline ${textClass}`}>
                        TUPT<span className="hidden lg:inline">-Thesis Archive</span>
                    </span>
                </div>
            </div>

            {/* Centered Search Bar (Only if logged in and NOT admin) */}
            {(mounted && isLoggedIn && !isAdmin) && (
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[200px] sm:max-w-md lg:max-w-2xl px-2 sm:px-4 transition-all duration-500 ease-out z-0 ${showSearch ? 'opacity-100 scale-100' : 'opacity-0 scale-95 -translate-y-[150%]'}`}>
                    <div
                        ref={searchContainerRef}
                    >
                        <div className="relative flex items-center w-full">
                            <div className={`absolute left-4 text-gray-400 z-10 pointer-events-none transition-colors ${localSearchQuery ? 'text-[#2DD4BF]' : ''}`}>
                                <FaSearch className="text-sm" />
                            </div>
                            <input
                                type="text"
                                className={`w-full py-2.5 sm:py-3 pl-10 pr-12 sm:pr-24 rounded-full border text-foreground text-[11px] sm:text-sm font-medium shadow-sm outline-none transition-all duration-300 focus:bg-card focus:ring-4 focus:ring-[#2DD4BF]/10 ${isRedHeader ? 'bg-card/10 border-white/10 text-white placeholder:text-white/50 focus:bg-card focus:border-white focus:text-foreground' : 'bg-surface border-border-custom text-foreground placeholder:text-gray-400 focus:bg-card focus:border-[#2DD4BF]/30'}`}
                                placeholder="Search..."
                                value={localSearchQuery}
                                onChange={(e) => {
                                    setLocalSearchQuery(e.target.value);
                                    onSearchChange(e.target.value);
                                }}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                onKeyPress={handleKeyPress}
                                autoCapitalize="none"
                                autoCorrect="off"
                                autoComplete="off"
                            />
                            <div className="absolute right-3 flex items-center gap-1">
                                <div className={`flex items-center justify-center transition-all duration-300 overflow-hidden ${localSearchQuery ? 'w-9 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                                    <button
                                        className={`p-2 rounded-full transition-all duration-300 hover:bg-black/5 flex items-center justify-center border-none cursor-pointer ${isRedHeader ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-[#2DD4BF]'}`}
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                    >
                                        <FaTimes className="text-xs" />
                                    </button>
                                </div>
                                <button
                                    className={`p-2 rounded-full transition-all duration-300 hover:bg-black/5 flex items-center justify-center border-none cursor-pointer ${isRedHeader ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-[#2DD4BF]'}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    aria-label="Search filters"
                                >
                                    <FaFilter className="text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Dropdown */}
                    {showFilters && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-xl p-4 z-50 border border-border-custom animate-fade-in">
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: <FaCalendarAlt className="text-[#2DD4BF]" />, label: 'Year:', value: filters.year, options: years, field: 'year' as keyof Filters, labelFn: (v: string) => v === 'all' ? 'All Years' : v },
                                    { icon: <FaFolder className="text-[#2DD4BF]" />, label: 'Department:', value: filters.category, options: categories, field: 'category' as keyof Filters, labelFn: (v: string) => v === 'all' ? 'All Departments' : v },
                                    { icon: <FaFileAlt className="text-[#2DD4BF]" />, label: 'Search in:', value: filters.searchType, options: ['all', 'title', 'abstract'], field: 'searchType' as keyof Filters, labelFn: (v: string) => v === 'all' ? 'All Fields' : v === 'title' ? 'Title Only' : 'Abstract Only' },
                                ].map(({ icon, label, value, options, field, labelFn }) => (
                                    <div key={field} className="flex items-center gap-2">
                                        <label className="flex items-center gap-1.5 text-sm font-semibold text-text-dim min-w-[100px]">
                                            {icon} {label}
                                        </label>
                                        <select
                                            className="flex-1 py-2 px-3 rounded-lg border border-border-custom text-sm text-text-dim bg-surface outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]/20 transition-all"
                                            value={value}
                                            onChange={(e) => handleFilterChange(field, e.target.value)}
                                        >
                                            {options.map((opt: string) => (
                                                <option key={opt} value={opt}>{labelFn(opt)}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div ref={resultsRef} className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-2xl z-50 border border-border-custom max-h-[70vh] overflow-hidden flex flex-col animate-fade-in">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom bg-surface/80">
                                <span className="text-sm font-semibold text-text-dim">
                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleRecommendByAi}
                                        disabled={isLoadingAi}
                                        className="flex items-center gap-1.5 text-xs font-bold text-[#2DD4BF] bg-teal-50 px-2 py-1 rounded-md hover:bg-teal-100 transition-colors disabled:opacity-50"
                                    >
                                        <FaMagic className="text-[10px]" />
                                        {isLoadingAi ? 'Generating...' : 'Recommend via AI'}
                                    </button>
                                    <button
                                        className="text-gray-400 text-sm bg-transparent border-none cursor-pointer hover:text-text-dim p-1"
                                        onClick={() => setShowSearchResults(false)}
                                        aria-label="Close results"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            {/* AI Recommendation Banner */}
                            {aiRecommendation && (
                                <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-100">
                                    <div className="flex items-start gap-2">
                                        <FaRobot className="text-blue-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 whitespace-pre-wrap text-xs text-text-dim font-medium">
                                            {aiRecommendation}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-y-auto flex-1">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={`${result.id}-${index}`}
                                        className="px-4 py-3.5 border-b border-gray-50 hover:bg-surface/80 transition-colors cursor-pointer"
                                        onClick={() => {
                                            router.push(`/search_result?id=${result.id}`);
                                            setShowSearchResults(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-end mb-2">
                                            <span className="flex items-center gap-1 text-xs text-text-dim font-semibold">
                                                <FaCalendarAlt className="text-[10px] text-[#2DD4BF]" /> {String(result.year_range && result.year_range !== 'unknown' ? result.year_range : 'N/A')}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground mb-1.5 leading-snug">
                                            {highlightText(result.title, localSearchQuery)}
                                        </h4>
                                        <p className="text-xs text-text-dim leading-relaxed mb-2 line-clamp-2">
                                            {highlightText(
                                                result.abstract && result.abstract.length > 120
                                                    ? `${result.abstract.substring(0, 120)}...`
                                                    : result.abstract,
                                                localSearchQuery
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold">
                                            {/* Date info already shown in header badge area */}
                                            <span className="flex items-center gap-1">
                                                <FaFileAlt className="text-[10px] text-[#2DD4BF]" /> {result.filename}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-4 py-2.5 bg-surface/80 border-t border-border-custom text-center">
                                <span className="text-xs text-gray-400 font-medium">
                                    {loading ? 'Searching...' : 'API Powered Search Engine'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Right Section: Auth or Notifications */}
            <div className="flex items-center gap-4 z-10">
                {!mounted ? (
                    <div className="h-10 opacity-0 pointer-events-none w-24"></div>
                ) : !isLoggedIn ? (
                    <>
                        <button
                            onClick={() => router.push('/login')}
                            className={`text-[11px] font-medium uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all relative group ${isTransparentPage && !scrolled ? 'text-white hover:bg-card/10' : 'text-white hover:bg-card/10'} ${pathname === '/login' ? 'bg-card/20' : ''}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push('/register')}
                            className={`text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-lg transition-all transform active:scale-95 relative group ${pathname === '/register' ? 'bg-card text-primary scale-105 ring-4 ring-primary/20' : (isRedHeader ? 'text-white hover:bg-white/10' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(45,212,191,0.1)]')}`}
                        >
                            Register
                        </button>
                    </>
                ) : (
                    isAdmin ? (
                        <button
                            onClick={handleLogout}
                            className="bg-card/15 text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-card/25 transition-all flex items-center gap-2 active:scale-95 border border-white/20 shadow-lg"
                        >
                            <FaSignOutAlt className="text-sm" />
                            Sign Out
                        </button>
                    ) : (
                        null
                    )
                )}
            </div>
        </header>
    );
};

export default CustomHeader;
