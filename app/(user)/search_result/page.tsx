'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaCalendarAlt, 
    FaFileAlt, 
    FaUserGraduate, 
    FaArrowLeft, 
    FaBookOpen, 
    FaTimes, 
    FaMagic, 
    FaSave, 
    FaRobot,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaChevronRight
} from 'react-icons/fa';
import LottieLoader from '@/app/components/UI/LottieLoader';
import AiReportSidebar from '@/app/components/Sidebar-modal/AiReportSidebar';
import SearchResultSkeleton from '@/app/components/UI/skeleton_loaders/users/SearchResultSkeleton';
import ThesisDetailSkeleton from '@/app/components/UI/skeleton_loaders/users/ThesisDetailSkeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Thesis {
    id: string;
    title: string;
    abstract: string;
    filename: string;
    category?: string;
    year_range?: string;
    author?: string;
}

const SearchResultContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    const [results, setResults] = useState<Thesis[]>([]);
    const [singleThesis, setSingleThesis] = useState<Thesis | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    
    // AI Modal states
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [localComparison, setLocalComparison] = useState<any>(null);
    const [savedPromptSuccess, setSavedPromptSuccess] = useState(false);

    const isBackNavRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            const startTime = Date.now();
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const isBackNav = !id && results.length > 0;
            isBackNavRef.current = isBackNav;

            const existingThesis = id ? results.find(t => t.id === id) : null;

            if (!id) {
                setSingleThesis(null);
                if (isBackNav) {
                    setLoading(false);
                    setShowSkeleton(false);
                } else {
                    setLoading(true);
                }
            } else if (singleThesis && singleThesis.id !== id) {
                if (!existingThesis) {
                    setSingleThesis(null);
                    setLoading(true);
                } else {
                    setSingleThesis(existingThesis);
                    setLoading(false);
                    setShowSkeleton(false);
                }
            } else if (!singleThesis) {
                if (existingThesis) {
                    setSingleThesis(existingThesis);
                    setLoading(false);
                    setShowSkeleton(false);
                } else {
                    setLoading(true);
                }
            }

            const skeletonTimer = setTimeout(() => {
                if (!existingThesis && !(!id && isBackNavRef.current)) {
                    setShowSkeleton(true);
                }
            }, 500);

            let didFetch = false;
            try {
                if (id) {
                    const res = await fetch(`${API_BASE_URL}/thesis/find-one/${id}`, { headers });
                    didFetch = true;
                    if (res.ok) {
                        const data = await res.json();
                        setSingleThesis(data);
                    } else if (!existingThesis) {
                        throw new Error('Thesis not found');
                    }
                } else if (query || year || category) {
                    const params = new URLSearchParams();
                    if (query) params.append('query', query);
                    if (year && year !== 'all') params.append('year', year);
                    if (category && category !== 'all') params.append('category', category);
                    if (type && type !== 'all') params.append('type', type);

                    const res = await fetch(`${API_BASE_URL}/thesis/search?${params.toString()}`, { headers });
                    didFetch = true;
                    if (res.ok) {
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
            } finally {
                const elapsed = Date.now() - startTime;
                const minDelay = (!id && didFetch) ? 2000 : 0;
                if (elapsed < minDelay) await new Promise(r => setTimeout(r, minDelay - elapsed));
                clearTimeout(skeletonTimer);
                setLoading(false);
                setShowSkeleton(false);
            }
        };
        fetchData();
    }, [id, query, year, category, type]);

    const handleRecommendByAi = async () => {
        if (!query || query.split(' ').filter(w => w.length > 0).length < 3) {
            alert('Your search query must be at least 3 words to use AI features.');
            return;
        }
        setIsLoadingAi(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/ai/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: query })
            });
            if (res.ok) {
                const data = await res.json();
                setAiRecommendation(data.recommendation);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoadingAi(false); }
    };

    const handleCompareLocal = async (thesisTitle?: string) => {
        const targetQuery = thesisTitle || query;
        if (!targetQuery || targetQuery.split(' ').filter(w => w.length > 0).length < 3) {
            alert('The content must be at least 3 words to check similarity.');
            return;
        }
        setIsLoadingLocal(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/ai/compare-local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: targetQuery })
            });
            if (res.ok) {
                const data = await res.json();
                setLocalComparison(data);
            }
        } catch (err) { console.error(err); }
        finally { setIsLoadingLocal(false); }
    };

    const handleSavePrompt = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/save-prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: query, recommendation: aiRecommendation || localComparison?.recommendation })
            });
            if (res.ok) {
                setSavedPromptSuccess(true);
                setTimeout(() => setSavedPromptSuccess(false), 3000);
            }
        } catch (err) { console.error(err); }
    };

    const extractAuthors = (thesis: Thesis) => thesis.author || 'Institutional Submission';

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
            {/* Header Navigation Area */}
            <div className="z-40 w-full pt-28 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AnimatePresence mode="wait">
                        {singleThesis ? (
                            <motion.button
                                key="back-results"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-primary hover:text-primary-hover font-black uppercase tracking-widest transition-all group"
                            >
                                <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Results
                            </motion.button>
                        ) : (
                            <motion.div
                                key="back-portal"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <Link
                                    href="/home"
                                    className="flex items-center gap-2 text-secondary hover:text-teal-200 font-black uppercase tracking-widest hover:underline transition-all group"
                                >
                                    <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Portal
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {!singleThesis && results.length > 0 && (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-card px-4 py-2 rounded-xl border border-border-custom">
                                {results.length} Documents Found
                            </span>
                            <button
                                onClick={handleRecommendByAi}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 px-4 py-2 rounded-xl hover:bg-[#2DD4BF]/10 transition-all shadow-lg shadow-[#2DD4BF]/5"
                            >
                                <FaRobot /> AI Suggest
                            </button>
                        </div>
                    )}
                </div>

                {/* AI / Local Loading Overlays (Within flow) */}
                {(isLoadingAi || isLoadingLocal) && (
                    <div className="mb-8 p-8 bg-card rounded-2xl border border-primary/20 shadow-2xl flex flex-col items-center justify-center animate-pulse">
                        <LottieLoader className="w-24 h-24 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Processing...</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">Analyzing repository context and patterns</p>
                    </div>
                )}
            </div>

            <main className="flex-grow flex flex-col pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
                <AnimatePresence mode="wait">
                    {loading && id && showSkeleton && !singleThesis ? (
                        <motion.div
                            key="skeleton-detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ThesisDetailSkeleton />
                        </motion.div>
                    ) : singleThesis ? (
                        <motion.div
                            key={`thesis-${singleThesis.id}`}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-4xl mx-auto pb-16 w-full"
                        >
                            <div className="relative group/paper">
                                <div className="absolute inset-0 bg-stone-200/40 rounded-3xl translate-y-6 translate-x-3 -rotate-2 transition-transform group-hover/paper:translate-y-8 group-hover/paper:rotate-[-3deg] duration-700" />
                                <div className="absolute inset-0 bg-stone-200/60 rounded-3xl translate-y-3 translate-x-1.5 rotate-1 transition-transform group-hover/paper:translate-y-4 group-hover/paper:rotate-[2deg] duration-700" />

                                <div className="relative bg-[#FCFCFA] text-stone-900 rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.5)] min-h-[1000px] flex flex-col p-8 md:p-14 overflow-hidden border border-stone-200">
                                    {/* Paper Texture Overlay */}
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />

                                    <div className="flex flex-col items-center text-center pb-8 mb-10 relative z-10 border-b-2 border-stone-900">
                                        <div className="flex items-center gap-6 mb-4">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Technological_University_of_the_Philippines_Seal.svg/1200px-Technological_University_of_the_Philippines_Seal.svg.png"
                                                alt="TUP Seal"
                                                className="w-16 h-16 object-contain filter grayscale opacity-90"
                                            />
                                            <div className="text-left">
                                                <h2 className="text-xl font-serif font-black text-stone-900 uppercase leading-none tracking-tight">Technological University</h2>
                                                <h2 className="text-xl font-serif font-black text-stone-900 uppercase leading-none tracking-tight">of the Philippines</h2>
                                                <p className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.3em] mt-1">Taguig Campus • Office of Archives</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-[-15px] rotate-[15deg] opacity-25 border-[4px] border-stone-900 px-4 py-1.5 rounded-lg text-stone-900 font-black text-xl uppercase tracking-wider select-none font-sans">
                                            Archived
                                        </div>
                                    </div>

                                    <div className="flex-grow flex flex-col relative z-10 px-4">
                                        {/* Watermark */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
                                            <div className="transform -rotate-45 scale-150 select-none whitespace-nowrap">
                                                <p className="text-9xl font-black uppercase text-stone-900 leading-none">TUP ARCHIVES TUP ARCHIVES</p>
                                            </div>
                                        </div>

                                        <div className="relative z-20 flex flex-col h-full">
                                            <div className="mb-14">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-4 italic">Formal Extraction Record ID: {singleThesis.id}</span>
                                                <h1 className="text-3xl md:text-3xl font-black text-stone-900 leading-[1.2] uppercase tracking-normal mb-10 font-serif border-l-4 border-stone-900 pl-6">
                                                    {singleThesis.title}
                                                </h1>
                                                <div className="flex flex-wrap gap-x-12 gap-y-6 pb-10 border-b border-stone-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Lead Author</span>
                                                        <span className="text-[13px] font-serif font-bold italic text-stone-800 underline decoration-stone-200 underline-offset-4">{singleThesis.author || 'Institutional Member'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Release Cycle</span>
                                                        <span className="text-[13px] font-bold text-stone-800">{singleThesis.year_range}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Classification</span>
                                                        <span className="text-[13px] font-black text-stone-800 px-2 py-1 bg-stone-100 rounded tracking-widest text-[10px]">{singleThesis.category}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-16">
                                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 mb-8 flex items-center gap-3">
                                                    <span className="w-2 h-0.5 bg-stone-900" /> Abstract Record
                                                </h3>
                                                <div className="text-stone-800 leading-[1.8] text-[15px] font-medium text-justify font-serif italic pl-4">
                                                    <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[1] first-letter:text-stone-900">
                                                        {singleThesis.abstract}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-auto pt-12 border-t border-stone-200">
                                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                                    <button
                                                        onClick={() => handleCompareLocal(singleThesis.title)}
                                                        className="flex-1 w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-black text-white py-5 px-8 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 active:scale-95 group"
                                                    >
                                                        <FaRobot className="text-primary group-hover:rotate-12 transition-transform" /> Check Similarity
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`${API_BASE_URL}/thesis/download/${singleThesis.filename}`, '_blank')}
                                                        className="flex-1 w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white py-5 px-8 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                                                    >
                                                        <FaFileAlt className="text-white" /> Access PDF Document
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-stone-100 opacity-30 flex flex-col items-center gap-2">
                                        <p className="text-[7px] font-black uppercase tracking-[0.8em] text-stone-500">© {new Date().getFullYear()} TUPT Digital Archives • Institutional Property</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : results.length > 0 ? (
                        <motion.div
                            key="results-grid"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
                        >
                            {results.map((thesis) => (
                                <Link
                                    key={thesis.id}
                                    href={`/search_result?id=${thesis.id}`}
                                    className="group bg-card p-6 rounded-2xl shadow-xl border border-border-custom hover:border-primary/30 hover:shadow-2xl active:scale-[0.98] transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-primary/20">
                                            {thesis.year_range}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{thesis.category}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-[1.4] tracking-tight">
                                        {thesis.title}
                                    </h3>
                                    <p className="text-sm text-text-dim line-clamp-3 mb-6 leading-relaxed font-medium">
                                        {thesis.abstract?.substring(0, 150)}...
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-white/[0.03] flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <FaFileAlt className="text-primary/50" /> {thesis.id}
                                        </div>
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/30 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:border-primary/50">
                                            View Details
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-20 text-center opacity-40 bg-card/50 rounded-3xl border border-border-custom"
                        >
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 border border-primary/10">
                                <FaSearch className="text-3xl text-primary" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Archive</h2>
                            <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-xs mx-auto">Execute search parameters to view the thesis repository inventory</p>
                            <Link href="/home" className="mt-10 px-8 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Return to Portal
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AiReportSidebar
                isOpen={isAiModalOpen && (!!aiRecommendation || !!localComparison)}
                onClose={() => setIsAiModalOpen(false)}
                query={query || ""}
                similarity={localComparison?.similarity}
                matchTitle={localComparison?.match?.title}
                recommendation={aiRecommendation || localComparison?.recommendation || ""}
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