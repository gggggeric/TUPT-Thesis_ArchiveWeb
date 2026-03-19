'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { FaCalendarAlt, FaFileAlt, FaUserGraduate, FaArrowLeft, FaBookOpen, FaTimes, FaMagic, FaSave, FaRobot } from 'react-icons/fa';
import Link from 'next/link';
import LottieLoader from '@/app/components/UI/LottieLoader';
import AiReportSidebar from '@/app/components/Sidebar-modal/AiReportSidebar';
import SearchResultSkeleton from '@/app/components/UI/SearchResultSkeleton';
import ThesisDetailSkeleton from '@/app/components/UI/ThesisDetailSkeleton';


interface Thesis {
    id?: string;
    title?: string;
    abstract?: string;
    author?: string;
    category?: string;
    filename?: string;
    year_range?: string;
    [key: string]: unknown;
}

const SearchResultContent = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const router = useRouter();

    const [results, setResults] = useState<Thesis[]>([]);
    const [singleThesis, setSingleThesis] = useState<Thesis | null>(null);
    const [loading, setLoading] = useState(true);
    const isBackNavRef = useRef(false);

    // AI Feature States
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState(false);
    const [localComparison, setLocalComparison] = useState<{ similarity: number; match: any; recommendation: string } | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [savedPromptSuccess, setSavedPromptSuccess] = useState(false);

    // Calculate year distribution - Grouped by Year
    const yearDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        results.forEach(thesis => {
            const rawYear = thesis.year_range || 'Unknown';
            // Extract the first 4-digit sequence (e.g., from "Jan 2023" or "2023-2024")
            const yearMatch = rawYear.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : (rawYear.toLowerCase() === 'unknown' ? 'Unknown' : 'Core');
            counts[year] = (counts[year] || 0) + 1;
        });
        // Sort years ascending for the timeline
        return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    }, [results]);

    useEffect(() => {
        const fetchData = async () => {
            const startTime = Date.now();
            
            // Sync UI state immediately with URL to prevent flickering
            if (!id && singleThesis) {
                setSingleThesis(null);
            }
            if (id && singleThesis && singleThesis.id !== id) {
                setSingleThesis(null);
            }

            // If we're going back to search and already have results, don't show full loading
            isBackNavRef.current = !id && results.length > 0;
            setLoading(true);

            let didFetch = false;
            try {
                const token = localStorage.getItem('token');
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                if (id) {
                    didFetch = true;
                    const res = await fetch(`${API_BASE_URL}/thesis/${id}`, { headers });
                    const contentType = res.headers.get("content-type");
                    if (res.ok && contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        setSingleThesis(data);
                    } else {
                        setSingleThesis(null);
                    }
                } else if (query || year || category) {
                    const params = new URLSearchParams();
                    if (query) params.append('query', query);
                    if (year && year !== 'all') params.append('year', year);
                    if (category && category !== 'all') params.append('category', category);
                    if (type && type !== 'all') params.append('type', type);

                    const res = await fetch(`${API_BASE_URL}/thesis/search?${params.toString()}`, { headers });
                    didFetch = true;
                    const contentType = res.headers.get("content-type");
                    if (res.ok && contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        setResults(data);
                    } else {
                        setResults([]);
                    }
                    setSingleThesis(null);
                } else {
                    setResults([]);
                    setSingleThesis(null);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                if (!id) setResults([]);
                setSingleThesis(null);
            } finally {
                const elapsed = Date.now() - startTime;
                // Only enforce 2s delay if we actually fetched from server
                const minDelay = didFetch ? 2000 : 0;
                
                if (elapsed < minDelay) {
                    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [id, year, query, type, category]);

    // Track recently viewed theses
    useEffect(() => {
        if (singleThesis && singleThesis.id) {
            const recent = JSON.parse(localStorage.getItem('recent_theses') || '[]');
            const newItem = {
                id: singleThesis.id,
                title: singleThesis.title,
                year: singleThesis.year_range
            };

            // Filter out existing and add to front
            const updated = [
                newItem,
                ...recent.filter((item: any) => item.id !== singleThesis.id)
            ].slice(0, 5);

            localStorage.setItem('recent_theses', JSON.stringify(updated));
        }
    }, [singleThesis]);

    const extractAuthors = (thesis: Thesis | undefined) => {
        if (!thesis) return 'Unknown Author';
        if (thesis.author) return thesis.author;
        // Improved extraction logic for TUPT format if author field is missing
        const match = thesis.abstract?.match(/(?:Researcher|Author|By|Researchers):\s*([^.]+)/i);
        return match ? match[1].trim() : 'Academic Research Group';
    };

    const handleRecommendByAi = async () => {
        if (!query) return;
        setIsLoadingAi(true);
        setAiRecommendation(null);
        setSavedPromptSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/thesis/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    query: query,
                    prompt: `I am looking for theses related to "${query}". Based on this query, please recommend a better or more specific thesis title. Your response MUST include three distinct sections formatted exactly like this:\n\nFunctional Requirements:\n[Your text here]\n\nConclusion:\n[Your text here]\n\nRecommendations:\n[Your text here]`
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch AI recommendation`);
            }

            const data = await response.json();
            setAiRecommendation(data.recommendation);
            setIsAiModalOpen(true);

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
                            prompt: query,
                            recommendation: data.recommendation
                        })
                    });
                } catch (saveError) {
                    console.error('Quietly failed to save AI history:', saveError);
                }
            }

        } catch (error) {
            console.error('Error getting AI recommendation:', error);
            alert('Failed to get AI recommendation. Please try again.');
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleCompareLocal = async () => {
        if (!query) return;
        setIsLoadingLocal(true);
        setLocalComparison(null);
        setSavedPromptSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/thesis/compare-local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ title: query })
            });

            if (!response.ok) throw new Error('Failed to compare locally');

            const data = await response.json();
            setLocalComparison({
                similarity: data.similarity,
                match: data.match,
                recommendation: data.recommendation
            });
            setIsAiModalOpen(true);
        } catch (error) {
            console.error('Error in local comparison:', error);
            alert('Failed to compare with local archive.');
        } finally {
            setIsLoadingLocal(false);
        }
    };

    const handleSavePrompt = () => {
        if (!aiRecommendation || !query) return;

        // Create a blob and download it as a .txt file
        const blob = new Blob([`Original Search Query: ${query}\n\nAI Recommended Structure:\n\n${aiRecommendation}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AI_Thesis_Recommendation_${query.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSavedPromptSuccess(true);
        setTimeout(() => setSavedPromptSuccess(false), 3000);
    };

    return (
        <div className="flex-1 relative py-16">
            <main className="flex-grow flex flex-col pt-12 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Results Area */}
                    <div className="flex-1">
                        {loading && (results.length === 0 || !isBackNavRef.current) ? (
                            <SearchResultSkeleton />
                        ) : (
                            <>
                                {/* Header Navigation */}
                                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {singleThesis ? (
                                        <button
                                            onClick={() => router.back()}
                                            className="flex items-center gap-2 text-secondary hover:text-teal-200 font-black uppercase tracking-widest hover:underline transition-all bg-transparent border-none cursor-pointer"
                                        >
                                            <FaArrowLeft className="text-xs" /> Back to Results
                                        </button>
                                    ) : (
                                        <Link
                                            href="/home"
                                            className="flex items-center gap-2 text-secondary hover:text-teal-200 font-black uppercase tracking-widest hover:underline transition-all"
                                        >
                                            <FaArrowLeft className="text-xs" /> Back to Portal
                                        </Link>
                                    )}
                                    <div className="flex flex-wrap gap-3">
                                        {year && (
                                            <span className="bg-primary/5 text-primary border border-primary/20 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                                Archive Year: {year}
                                            </span>
                                        )}
                                        {category && (
                                            <span className="bg-primary/5 text-primary border border-primary/20 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                                Department: {category}
                                            </span>
                                        )}
                                        {query && (
                                            <span className="bg-primary/10 text-white border border-primary/30 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                                                Query: "{query}"
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* AI Recommendation Feature for Search Queries */}
                                {!singleThesis && query && (
                                    <div className="mb-8 bg-card rounded-2xl shadow-xl border border-border-custom overflow-hidden animate-fade-in relative">
                                        {(isLoadingAi || isLoadingLocal) && (
                                            <LottieLoader
                                                type="ai"
                                                isModal
                                                text="AI is thinking please wait..."
                                            />
                                        )}
                                        <div className="p-6 md:p-8 relative z-10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                                                        <FaRobot className="text-primary text-xl" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-foreground tracking-tight">Suggested Improvements</h3>
                                                        {query && query.trim().split(/\s+/).length <= 1 ? (
                                                            <p className="text-[11px] text-red-400 font-bold tracking-wide animate-pulse">
                                                                Note: One word isn't enough for a valid title recommendation or comparison.
                                                            </p>
                                                        ) : (
                                                            <p className="text-[11px] text-text-dim font-medium tracking-wide">Get AI suggestions for your thesis title</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {(query && query.trim().split(/\s+/).length > 1) && (
                                                    <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                        <button
                                                            onClick={aiRecommendation ? () => setIsAiModalOpen(true) : handleRecommendByAi}
                                                            disabled={isLoadingAi || isLoadingLocal}
                                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${aiRecommendation ? 'bg-primary text-white border-none' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/10 hover:border-primary/50'}`}
                                                        >
                                                            <FaMagic className={isLoadingAi ? 'animate-spin' : ''} />
                                                            {isLoadingAi ? 'Analyzing...' : aiRecommendation ? 'View Suggestion' : 'AI Suggest'}
                                                        </button>

                                                        <button
                                                            onClick={localComparison ? () => setIsAiModalOpen(true) : handleCompareLocal}
                                                            disabled={isLoadingAi || isLoadingLocal}
                                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${localComparison ? 'bg-primary text-white border-none' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50'}`}
                                                        >
                                                            <FaBookOpen className={isLoadingLocal ? 'animate-spin' : ''} />
                                                            {isLoadingLocal ? 'Checking...' : localComparison ? 'View Results' : 'Check Similarity'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Archive Distribution - AREA LINE CHART */}
                                {!singleThesis && results.length > 0 && (() => {
                                    const W = 560, H = 220, PAD = { top: 20, right: 20, bottom: 40, left: 40 };
                                    const chartW = W - PAD.left - PAD.right;
                                    const chartH = H - PAD.top - PAD.bottom;
                                    const years = yearDistribution.map(([y]) => y);
                                    const counts = yearDistribution.map(([, c]) => c as number);
                                    // Dataset 1: all years (main data), Dataset 2: smoothed offset for visual richness
                                    const ds1 = counts;
                                    const ds2 = counts.map((v, i) => Math.max(0, Math.round(v * (0.5 + 0.3 * Math.sin(i * 1.2 + 1)))));
                                    const maxVal = Math.max(...ds1, ...ds2, 1);
                                    const n = years.length;
                                    const xPos = (i: number) => PAD.left + (n <= 1 ? chartW / 2 : (i / (n - 1)) * chartW);
                                    const yPos = (v: number) => PAD.top + chartH - (v / maxVal) * chartH;
                                    const makePath = (data: number[]) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(v)}`).join(' ');
                                    const makeArea = (data: number[]) => `${makePath(data)} L${xPos(n - 1)},${PAD.top + chartH} L${xPos(0)},${PAD.top + chartH} Z`;
                                    const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

                                    return (
                                        <div className="mb-12 animate-fade-in group/graph block">
                                            <div className="relative">
                                                <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-3xl opacity-20 pointer-events-none" />
                                                <div className="relative bg-[#0f172a]/30 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/5 shadow-2xl overflow-hidden group-hover/graph:border-white/10 transition-all duration-500">
                                                    {/* Header row */}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover/graph:scale-110 transition-transform duration-700">
                                                                <FaCalendarAlt className="text-primary text-lg drop-shadow-[0_0_12px_rgba(45,212,191,0.4)]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Institutional Repository</p>
                                                                <p className="text-xl font-black text-white tracking-tight italic font-serif">Archive Distribution</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-8">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                                                                <span className="text-2xl font-black text-white group-hover/graph:text-primary transition-colors duration-500">{results.length}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Peak Year</span>
                                                                <span className="text-2xl font-black text-primary">
                                                                    {yearDistribution.length > 0 ? yearDistribution.reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0] : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SVG Chart */}
                                                    <div className="w-full overflow-x-auto">
                                                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 320 }}>
                                                            <defs>
                                                                <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
                                                                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.04" />
                                                                </linearGradient>
                                                                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#86efac" stopOpacity="0.25" />
                                                                    <stop offset="100%" stopColor="#86efac" stopOpacity="0.03" />
                                                                </linearGradient>
                                                            </defs>

                                                            {/* Y-axis grid lines + labels */}
                                                            {yTicks.map((tick, ti) => (
                                                                <g key={`ytick-${ti}`}>
                                                                    <line
                                                                        x1={PAD.left} y1={yPos(tick)}
                                                                        x2={W - PAD.right} y2={yPos(tick)}
                                                                        stroke="rgba(255,255,255,0.07)" strokeWidth="1"
                                                                    />
                                                                    <text x={PAD.left - 6} y={yPos(tick) + 4} textAnchor="end" fontSize="9" fill="rgba(148,163,184,0.8)" fontFamily="sans-serif">{tick}</text>
                                                                </g>
                                                            ))}

                                                            {/* X-axis baseline */}
                                                            <line
                                                                x1={PAD.left} y1={PAD.top + chartH}
                                                                x2={W - PAD.right} y2={PAD.top + chartH}
                                                                stroke="rgba(255,255,255,0.12)" strokeWidth="1"
                                                            />

                                                            {/* Dataset 2 area + line (lighter, behind) */}
                                                            {n > 0 && (
                                                                <>
                                                                    <path d={makeArea(ds2)} fill="url(#areaGrad2)" />
                                                                    <path d={makePath(ds2)} fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinejoin="round" />
                                                                </>
                                                            )}

                                                            {/* Dataset 1 area + line (main, in front) */}
                                                            {n > 0 && (
                                                                <>
                                                                    <path d={makeArea(ds1)} fill="url(#areaGrad1)" />
                                                                    <path d={makePath(ds1)} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />
                                                                </>
                                                            )}

                                                            {/* Dots + tooltips for Dataset 1 */}
                                                            {ds1.map((v, i) => (
                                                                <g key={`d1-${i}`} className="group/dot">
                                                                    <circle cx={xPos(i)} cy={yPos(v)} r="5" fill="#4ade80" stroke="#0f172a" strokeWidth="2" opacity="0.9" />
                                                                    {/* invisible large hit area */}
                                                                    <circle cx={xPos(i)} cy={yPos(v)} r="14" fill="transparent" className="cursor-pointer" />
                                                                    {/* Tooltip */}
                                                                    <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200" style={{ pointerEvents: 'none' }}>
                                                                        <rect x={xPos(i) - 30} y={yPos(v) - 32} width="60" height="22" rx="5" fill="rgba(15,23,42,0.92)" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
                                                                        <text x={xPos(i)} y={yPos(v) - 17} textAnchor="middle" fontSize="10" fill="#4ade80" fontFamily="sans-serif" fontWeight="bold">{v} rec</text>
                                                                    </g>
                                                                </g>
                                                            ))}

                                                            {/* Dots for Dataset 2 */}
                                                            {ds2.map((v, i) => (
                                                                <circle key={`d2-${i}`} cx={xPos(i)} cy={yPos(v)} r="3.5" fill="#86efac" stroke="#0f172a" strokeWidth="1.5" opacity="0.75" />
                                                            ))}

                                                            {/* X-axis labels */}
                                                            {years.map((yr, i) => (
                                                                <text
                                                                    key={yr}
                                                                    x={xPos(i)} y={PAD.top + chartH + 18}
                                                                    textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.8)"
                                                                    fontFamily="sans-serif"
                                                                >
                                                                    {yr === 'Unknown' ? 'N/A' : yr}
                                                                </text>
                                                            ))}
                                                        </svg>
                                                    </div>

                                                    {/* Legend */}
                                                    <div className="flex items-center gap-6 mt-3 pl-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-0.5 rounded" style={{ background: 'linear-gradient(to right,#4ade80,#4ade80)', display: 'block' }} />
                                                            <div className="w-2 h-2 rounded-sm bg-[#4ade80]/30 border border-[#4ade80]/60" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Archive Records</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-0.5 rounded bg-[#86efac]" />
                                                            <div className="w-2 h-2 rounded-sm bg-[#86efac]/30 border border-[#86efac]/60" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relative Trend</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {loading && id && !singleThesis ? (
                                    <ThesisDetailSkeleton />
                                ) : singleThesis ? (
                                    /* Document-Style Detail View */
                                    <div className="max-w-3xl mx-auto animate-fade-in pb-16">
                                        <div className="relative group/paper">
                                            <div className="absolute inset-0 bg-stone-200/40 rounded-3xl translate-y-6 translate-x-3 -rotate-2 transition-transform group-hover/paper:translate-y-8 group-hover/paper:rotate-[-3deg] duration-700" />
                                            <div className="absolute inset-0 bg-stone-200/60 rounded-3xl translate-y-3 translate-x-1.5 rotate-1 transition-transform group-hover/paper:translate-y-4 group-hover/paper:rotate-[2deg] duration-700" />

                                            <div className="relative bg-[#fafaf8] text-stone-900 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.4)] min-h-[900px] flex flex-col p-8 md:p-14 overflow-hidden border border-stone-200">
                                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />

                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                                                    <img src="/assets/tup-logo.png" alt="" className="w-[500px] h-[500px] object-contain rotate-[-15deg]" />
                                                </div>

                                                <div className="flex flex-col items-center text-center pb-8 mb-10 relative z-10">
                                                    <img src="/assets/tup-logo.png" alt="TUP Logo" className="w-16 h-16 mb-4 contrast-110 shadow-sm" />
                                                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-stone-900 mb-1">Technological University of the Philippines</h4>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-4">Taguig City Campus</h5>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 border-t border-stone-200 pt-4 w-full">Office of the University Registrar • Digital Research Repository</p>
                                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black" />
                                                    <div className="absolute top-2 right-[-15px] rotate-[15deg] opacity-35 border-[4px] border-[#B22222]/70 px-4 py-1.5 rounded-lg text-[#B22222] font-black text-xl uppercase tracking-wider select-none font-sans">
                                                        Archived
                                                    </div>
                                                </div>

                                                <div className="flex-grow flex flex-col relative z-10 px-4">
                                                    <div className="flex justify-between items-start mb-14">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-stone-400 mb-1">Accession Number</span>
                                                            <span className="text-[11px] font-mono font-black border-b border-stone-100 pb-1">{singleThesis.id || 'THESIS_0000'}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-stone-400 mb-1">Certification Date</span>
                                                            <span className="text-[11px] font-black border-b border-stone-100 pb-1">Mar 2026</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-center mb-14 px-2">
                                                        <h1 className="text-3xl md:text-3xl font-black text-stone-900 leading-[1.2] uppercase tracking-normal mb-8 font-serif">
                                                            {singleThesis.title}
                                                        </h1>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-2">Formal Thesis Extract</p>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="h-[2px] bg-stone-100 w-8" />
                                                            <span className="text-[10px] font-black text-stone-900">{singleThesis.category || 'BET'}</span>
                                                            <div className="h-[2px] bg-stone-100 w-8" />
                                                        </div>
                                                    </div>

                                                    <div className="mb-14 text-center">
                                                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Authors</h3>
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-lg md:text-xl font-bold text-stone-900 leading-tight font-serif italic mb-2">
                                                                {extractAuthors(singleThesis)}
                                                            </p>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 italic">Faculty of Computing and Engineering</p>
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Abstract</h3>
                                                        <div className="text-stone-800 leading-[1.8] text-[14px] font-medium text-justify font-serif">
                                                            {singleThesis.abstract ? (
                                                                <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:leading-[1] first-letter:text-stone-900">
                                                                    {singleThesis.abstract}
                                                                </p>
                                                            ) : (
                                                                <p className="italic text-stone-400">No abstract available for this record.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-16 pb-8 opacity-30 flex flex-col items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-stone-900" />
                                                        <div className="w-1 h-1 rounded-full bg-stone-900" />
                                                        <div className="w-1 h-1 rounded-full bg-stone-900" />
                                                    </div>
                                                    <p className="text-[7px] font-black uppercase tracking-[1em] text-stone-500 mr-[-1em]">Institutional Security</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : results.length > 0 ? (
                                    /* Filtered List View */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative z-10">
                                        {results.map((thesis) => (
                                            <Link
                                                key={thesis.id}
                                                href={`/search_result?id=${thesis.id}`}
                                                className="group bg-card p-6 rounded-2xl shadow-xl border border-border-custom hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-primary/20">
                                                        {thesis.year_range || 'Unknown'}
                                                    </span>
                                                    <FaUserGraduate className="text-gray-300 group-hover:text-secondary transition-colors" />
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                    {thesis.title}
                                                </h3>
                                                <p className="text-sm text-text-dim line-clamp-3 mb-6 leading-relaxed font-medium">
                                                    {thesis.abstract?.substring(0, 150)}...
                                                </p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        <FaFileAlt className="text-primary/50" /> {thesis.id}
                                                    </div>
                                                    <button className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/30 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:border-primary/50">
                                                        View Details
                                                    </button>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-card rounded-3xl shadow-xl border border-border-custom relative z-10">
                                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FaFileAlt className="text-4xl text-gray-300" />
                                        </div>
                                        <h2 className="text-2xl font-black text-foreground">No results found</h2>
                                        <p className="text-text-dim mt-2">Try adjusting your search or filters in the header.</p>
                                        <Link href="/home" className="inline-block mt-8 bg-primary/5 text-primary border border-primary/30 px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary/20 transition-all">
                                            Return to Portal
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <AiReportSidebar
                isOpen={isAiModalOpen && (!!aiRecommendation || !!localComparison)}
                onClose={() => setIsAiModalOpen(false)}
                query={query || ""}
                similarity={localComparison?.similarity}
                matchTitle={localComparison?.match?.title}
                recommendation={aiRecommendation || localComparison?.recommendation || ""}
                onReAnalyze={localComparison ? () => {
                    setLocalComparison(null);
                    handleRecommendByAi();
                } : undefined}
                onSave={handleSavePrompt}
                isSaved={savedPromptSuccess}
                headerTitle="Archive Analysis Portal"
                headerSubtitle="Institutional Intelligence System"
            />
        </div>
    );
};

const SearchResultPage = () => {
    return (
        <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-28 relative">
                <SearchResultSkeleton />
            </div>
        }>
            <SearchResultContent />
        </Suspense>
    );
};

export default SearchResultPage;
