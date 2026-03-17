'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CustomHeader from '@/components/Navigation/CustomHeader';
import Sidebar from '@/components/Navigation/Sidebar';
import Footer from '@/components/Navigation/Footer';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { FaCalendarAlt, FaFileAlt, FaUserGraduate, FaArrowLeft, FaBookOpen, FaTimes, FaMagic, FaSave, FaRobot } from 'react-icons/fa';
import Link from 'next/link';
import LottieLoader from '@/components/UI/LottieLoader';

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
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    const [results, setResults] = useState<Thesis[]>([]);
    const [singleThesis, setSingleThesis] = useState<Thesis | null>(null);
    const [loading, setLoading] = useState(true);

    // AI Feature States
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState(false);
    const [localComparison, setLocalComparison] = useState<{ similarity: number; match: any; recommendation: string } | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [savedPromptSuccess, setSavedPromptSuccess] = useState(false); useEffect(() => {
        const fetchData = async () => {
            const startTime = Date.now();
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                if (id) {
                    const res = await fetch(`${API_BASE_URL}/thesis/${id}`, { headers });
                    const contentType = res.headers.get("content-type");
                    if (res.ok && contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        setSingleThesis(data);
                    } else {
                        setSingleThesis(null);
                    }
                    setResults([]);
                } else if (query || year || category) {
                    const params = new URLSearchParams();
                    if (query) params.append('query', query);
                    if (year && year !== 'all') params.append('year', year);
                    if (category && category !== 'all') params.append('category', category);
                    if (type && type !== 'all') params.append('type', type);

                    const res = await fetch(`${API_BASE_URL}/thesis/search?${params.toString()}`, { headers });
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
                setResults([]);
                setSingleThesis(null);
            } finally {
                // Ensure minimum 3s delay
                const elapsed = Date.now() - startTime;
                if (elapsed < 3000) {
                    await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
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
        <div className="min-h-screen bg-transparent flex font-sans text-white relative overflow-hidden">
            <Sidebar 
                isExpanded={sidebarExpanded} 
                onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
            />

            <div className={`flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarExpanded ? 'pl-[280px]' : 'pl-[80px]'}`}>
                <CustomHeader
                    onMenuPress={() => setSidebarExpanded(!sidebarExpanded)}
                />


            <main className="flex-1 pt-32 pb-40 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Results Area */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <LottieLoader type="search" isModal text="Finding Theses..." />
                            </div>
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
                                <div className="p-6 md:p-8 relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                                                <FaRobot className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground tracking-tight">Proposed Refinements</h3>
                                                <p className="text-[11px] text-text-dim font-medium tracking-wide">Optimize your thesis title using institutional AI analysis</p>
                                            </div>
                                        </div>

                                            <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                            <button
                                                onClick={aiRecommendation ? () => setIsAiModalOpen(true) : handleRecommendByAi}
                                                disabled={isLoadingAi || isLoadingLocal}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${aiRecommendation ? 'bg-primary text-white border-none' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/10 hover:border-primary/50'}`}
                                            >
                                                <FaMagic className={isLoadingAi ? 'animate-spin' : ''} />
                                                {isLoadingAi ? 'Analyzing...' : aiRecommendation ? 'View Proposal' : 'AI Refine'}
                                            </button>
                                            
                                            <button
                                                onClick={localComparison ? () => setIsAiModalOpen(true) : handleCompareLocal}
                                                disabled={isLoadingAi || isLoadingLocal}
                                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${localComparison ? 'bg-primary text-white border-none' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50'}`}
                                            >
                                                <FaBookOpen className={isLoadingLocal ? 'animate-spin' : ''} />
                                                {isLoadingLocal ? 'Checking...' : localComparison ? 'View Results' : 'Archive Audit'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {singleThesis ? (
                            /* Document-Style Detail View */
                            <div className="max-w-3xl mx-auto animate-fade-in pb-16">
                                {/* Paper Stack Effect */}
                                <div className="relative group/paper">
                                    <div className="absolute inset-0 bg-stone-200/40 rounded-3xl translate-y-6 translate-x-3 -rotate-2 transition-transform group-hover/paper:translate-y-8 group-hover/paper:rotate-[-3deg] duration-700" />
                                    <div className="absolute inset-0 bg-stone-200/60 rounded-3xl translate-y-3 translate-x-1.5 rotate-1 transition-transform group-hover/paper:translate-y-4 group-hover/paper:rotate-[2deg] duration-700" />
                                    
                                    <div className="relative bg-white text-stone-900 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.4)] min-h-[900px] flex flex-col p-8 md:p-14 overflow-hidden border border-stone-200">
                                        {/* Paper Texture Overlay */}
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
                                        
                                        {/* TUP Watermark */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                                            <img src="/assets/tup-logo.png" alt="" className="w-[500px] h-[500px] object-contain rotate-[-15deg]" />
                                        </div>

                                        {/* Corner Fold Detail (Top-Left) */}
                                        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-stone-100 to-transparent pointer-events-none z-20">
                                            <div className="absolute top-0 left-0 w-full h-px bg-stone-300 rotate-[45deg] origin-top-left opacity-60" />
                                        </div>
                                        <div className="absolute top-4 left-4 w-12 h-4 bg-stone-200 rounded-sm -rotate-45 border border-stone-300 shadow-sm opacity-40 z-20" />

                                        {/* Institutional Letterhead - REFINED */}
                                        <div className="flex flex-col items-center text-center pb-8 mb-10 relative z-10">
                                            <img src="/assets/tup-logo.png" alt="TUP Logo" className="w-16 h-16 mb-4 contrast-110 shadow-sm" />
                                            <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-stone-900 mb-1">Technological University of the Philippines</h4>
                                            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-4">Taguig City Campus</h5>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 border-t border-stone-200 pt-4 w-full">Office of the University Registrar • Digital Research Repository</p>
                                            
                                            {/* Divider bar - SOLID BLACK AS IN IMAGE */}
                                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black" />
                                            
                                            {/* Official Archive Stamp - RED AS IN IMAGE */}
                                            <div className="absolute top-2 right-[-15px] rotate-[15deg] opacity-35 border-[4px] border-[#B22222]/70 px-4 py-1.5 rounded-lg text-[#B22222] font-black text-xl uppercase tracking-wider select-none transform transition-transform group-hover/paper:scale-105 duration-500 font-sans">
                                                Archived
                                            </div>
                                        </div>

                                        {/* Document Content */}
                                        <div className="flex-grow flex flex-col relative z-10 px-4">
                                            {/* Metadata Bar */}
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

                                            {/* Title Section - BOLD SERIF */}
                                            <div className="text-center mb-14 px-2">
                                                <h1 className="text-3xl md:text-3xl font-black text-stone-900 leading-[1.2] uppercase tracking-normal mb-8 font-serif">
                                                    {singleThesis.title}
                                                </h1>
                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-2">Formal Thesis Extract</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-[2px] bg-stone-100 w-8" />
                                                    <span className="text-[10px] font-black text-stone-900">{singleThesis.category ? singleThesis.category.split(' ')[0] : 'BET'}</span>
                                                    <div className="h-[2px] bg-stone-100 w-8" />
                                                </div>
                                            </div>

                                            {/* Authors / Investigative Council */}
                                            <div className="mb-14 text-center">
                                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Investigative Council</h3>
                                                <div className="flex flex-col items-center">
                                                    <p className="text-lg md:text-xl font-bold text-stone-900 leading-tight font-serif italic mb-2">
                                                        {extractAuthors(singleThesis)}
                                                    </p>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 italic">Faculty of Computing and Engineering</p>
                                                </div>
                                            </div>

                                            {/* Abstract Section - DROP CAP & JUSTIFIED */}
                                            <div className="relative">
                                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-8">Executive Abstract</h3>
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

                                        {/* Official Integrity Mark */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                {results.map((thesis) => (
                                    <Link
                                        key={thesis.id}
                                        href={`/search_result?id=${thesis.id}`}
                                        className="group bg-card p-6 rounded-2xl shadow-xl border border-border-custom hover:border-primary/30 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            {thesis.year_range && thesis.year_range.toLowerCase() !== 'unknown' ? (
                                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-primary/20">
                                                    {thesis.year_range}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-500 bg-white/5 px-3 py-1 rounded-lg uppercase tracking-wider border border-white/5">
                                                    Unknown
                                                </span>
                                            )}
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
                                            <button className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/30 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(45,212,191,0.1)] active:scale-95">
                                                Review Record
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-card rounded-3xl shadow-xl border border-border-custom">
                                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaFileAlt className="text-4xl text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground">No results found</h2>
                                <p className="text-text-dim mt-2">Try adjusting your search or filters in the header.</p>
                                <Link href="/home" className="inline-block mt-8 bg-primary/5 text-primary border border-primary/30 px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 active:scale-95">
                                    Return to Portal
                                </Link>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* AI Recommendation Modal */}
            {isAiModalOpen && (aiRecommendation || localComparison) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#0f0f0f] rounded-2xl p-8 md:p-14 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border border-white/[0.05] text-white/90">
                        <button
                            onClick={() => setIsAiModalOpen(false)}
                            className="absolute top-8 right-8 w-11 h-11 flex items-center justify-center bg-white/[0.03] hover:bg-primary/20 text-gray-500 hover:text-primary rounded-xl transition-all z-10 border border-white/[0.05]"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                        
                        <div className="flex items-center gap-6 mb-10 flex-shrink-0 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${localComparison ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                                {localComparison ? <FaBookOpen className="text-primary text-3xl" /> : <FaRobot className="text-primary text-3xl" />}
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-2">
                                    {localComparison ? 'Archive Audit Results' : 'Refinement Proposal'}
                                </h3>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Target: &quot;{query}&quot;</p>
                            </div>
                        </div>

                        {localComparison && (
                            <div className="mb-8 bg-white/[0.02] rounded-xl p-6 border border-white/[0.03] animate-fade-in flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Similarity Metrics</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${localComparison.similarity > 40 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                        {localComparison.similarity}% Structural Match
                                    </span>
                                </div>
                                {localComparison.match && (
                                    <p className="text-[12px] text-white/60 font-medium italic border-l-2 border-primary/30 pl-4 py-1">
                                        Potential Conflict: &quot;{localComparison.match.title}&quot; (Ref: {localComparison.match.id})
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-8 md:p-10 shadow-inner overflow-y-auto flex-grow relative z-10 custom-scrollbar">
                            <div className="text-[15px] text-white/70 font-medium leading-relaxed">
                                {(localComparison?.recommendation || aiRecommendation || "").split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className="min-h-[1.5em] mb-2">
                                        {line.replace(/^\s*\*\s/, '• ').replace(/^\s*-\s/, '• ').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 flex gap-3 justify-end flex-shrink-0 relative z-10">
                            {localComparison && (
                                <button
                                    onClick={() => {
                                        setLocalComparison(null);
                                        handleRecommendByAi();
                                    }}
                                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase bg-surface text-text-dim border border-border-custom hover:text-foreground transition-all duration-300 active:scale-95"
                                >
                                    <FaRobot className="text-lg" />
                                    Ask for More AI Ideas
                                </button>
                            )}
                            <button
                                onClick={handleSavePrompt}
                                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-lg active:scale-95 ${savedPromptSuccess ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)]'}`}
                            >
                                <FaSave className={savedPromptSuccess ? 'text-green-500 text-lg' : 'text-primary text-lg'} />
                                {savedPromptSuccess ? 'Protocol Saved' : 'Export Analysis'}
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

const SearchResultPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center fixed inset-0 z-[100] pointer-events-none backdrop-blur-sm">
                <LottieLoader type="search" isModal text="Finding Theses..." />
            </div>
        }>
            <SearchResultContent />
        </Suspense>
    );
};

export default SearchResultPage;
