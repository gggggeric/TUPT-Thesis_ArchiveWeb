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
    FaChevronRight,
    FaHandshake
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import LottieLoader from '@/app/components/UI/LottieLoader';
import AiReportSidebar from '@/app/components/AI-Sidebar/AiReportSidebar';
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
    _id?: string;
    isUploadedByUndergrad?: boolean;
    createdBy?: string;
    hasRequestedCollaboration?: boolean;
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
    const [statusModal, setStatusModal] = useState<{ show: boolean, message: string } | null>(null);

    // Collaboration states
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
    const [collaborationThesis, setCollaborationThesis] = useState<Thesis | null>(null);
    const [collaborationMessage, setCollaborationMessage] = useState('');
    const [isSubmittingCollaboration, setIsSubmittingCollaboration] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

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
            setStatusModal({
                show: true,
                message: 'Your search query must be at least 3 words to use AI features.'
            });
            return;
        }
        setLocalComparison(null); // Clear previous similarity check
        setIsLoadingAi(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/thesis/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: query, query })
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
            setStatusModal({
                show: true,
                message: 'The title/content must be at least 3 words to check similarity.'
            });
            return;
        }
        setAiRecommendation(null); // Clear previous AI recommendation
        setIsLoadingLocal(true);
        setIsAiModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/thesis/compare-local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: targetQuery })
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
            const res = await fetch(`${API_BASE_URL}/user/ai-history`, {
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

    const handleRequestCollaboration = async () => {
        if (!collaborationMessage.trim()) {
            toast.error('Please enter a message for your collaboration request.');
            return;
        }
        setIsSubmittingCollaboration(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    thesisId: collaborationThesis?._id,
                    message: collaborationMessage
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Collaboration request sent successfully!');
                setIsCollaborationModalOpen(false);
                setCollaborationMessage('');

                // Update local state to reflect the sent request
                if (singleThesis && singleThesis._id === collaborationThesis?._id) {
                    setSingleThesis({ ...singleThesis, hasRequestedCollaboration: true });
                }
                setResults(prev => prev.map(t =>
                    t._id === collaborationThesis?._id ? { ...t, hasRequestedCollaboration: true } : t
                ));
                setCollaborationThesis(null);
            } else {
                toast.error(data.message || 'Failed to send collaboration request');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmittingCollaboration(false);
        }
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

                    {(!singleThesis && (results.length > 0 || query)) && (
                        <div className="flex items-center gap-4 animate-fade-in">
                            {results.length > 0 && (
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-card px-4 py-2 rounded-xl border border-border-custom whitespace-nowrap">
                                    {results.length} Documents Found
                                </span>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCompareLocal()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/10 transition-all shadow-lg"
                                >
                                    <FaSearch className="text-[8px]" /> Check Similarity
                                </button>
                                <button
                                    onClick={handleRecommendByAi}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 px-4 py-2 rounded-xl hover:bg-[#2DD4BF]/10 transition-all shadow-lg shadow-[#2DD4BF]/5"
                                >
                                    <FaRobot /> AI Suggest
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI / Local Loading Overlays (Full Screen Modal) */}
                {(isLoadingAi || isLoadingLocal) && (
                    <LottieLoader
                        isModal={true}
                        type="ai"
                        text={isLoadingLocal ? 'Comparing to Local Sources please wait' : 'AI is thinking'}
                        subtext={isLoadingLocal ? 'Analyzing repository context and patterns' : 'Generating intelligent recommendations'}
                    />
                )}
            </div>

            <main className="flex-grow flex flex-col pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
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

                                <div className="relative bg-[#FCFCFA] text-[#1A1A1A] rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.5)] min-h-screen flex flex-col p-12 md:p-20 overflow-hidden border border-stone-200">
                                    {/* Watermark from AiReportSidebar */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                        <img src="/assets/tup-logo.png" alt="" className="w-[500px] grayscale" />
                                    </div>

                                    {/* Paper Header from AiReportSidebar */}
                                    <div className="relative z-10 flex flex-col items-center text-center gap-6 border-b-[3px] border-[#1A1A1A] pb-10 mb-12">
                                        {/* Archived Stamp */}
                                        <div className="absolute -top-4 -right-4 md:top-0 md:right-0 transform rotate-[15deg] border-4 border-red-800/20 text-red-800/20 px-4 py-1 font-black text-2xl uppercase tracking-[0.2em] pointer-events-none select-none italic">
                                            ARCHIVED
                                        </div>

                                        <img src="/assets/tup-logo.png" alt="TUP Logo" className="w-20 h-20 object-contain" />

                                        <div className="space-y-1">
                                            <h4 className="text-[15px] font-black uppercase tracking-[0.2em]">Technological University of the Philippines</h4>
                                            <p className="text-[11px] font-bold text-[#666] uppercase tracking-[0.3em]">Taguig City Campus</p>
                                        </div>

                                        <div className="w-full border-t border-[#1A1A1A]/10 pt-4 mt-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888]">
                                                Office of the University Registrar • Digital Research Repository
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="relative z-10 flex-grow flex flex-col gap-12">
                                        {/* Meta Row */}
                                        <div className="flex justify-between items-end border-b border-[#1A1A1A]/10 pb-6 text-[10px]">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black text-[#999] uppercase tracking-widest">Accession Number</span>
                                                <span className="font-bold uppercase">{singleThesis.id}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 text-right">
                                                <span className="font-black text-[#999] uppercase tracking-widest">Classification</span>
                                                <span className="font-bold uppercase">{singleThesis.category}</span>
                                            </div>
                                        </div>

                                        {/* Title Section */}
                                        <div className="text-center">
                                            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight font-serif uppercase tracking-tight">
                                                {singleThesis.title}
                                            </h2>
                                            <div className="mt-8 flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-black text-[#999] uppercase tracking-[0.5em]">Principal Author</span>
                                                <p className="text-sm font-bold italic font-serif text-[#444] uppercase tracking-widest">{singleThesis.author || 'Institutional Member'}</p>
                                            </div>
                                        </div>

                                        {/* Abstract Body */}
                                        <div className="space-y-8">
                                            <h4 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-4">
                                                <span className="w-10 h-[2px] bg-[#1A1A1A]" />
                                                Abstract Record
                                                <span className="flex-1 h-[1px] bg-[#1A1A1A]/10" />
                                            </h4>
                                            <div className="text-[#222] leading-[1.8] text-[15.5px] font-serif text-justify">
                                                <p className="first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:leading-[0.8] first-letter:text-[#1A1A1A]">
                                                    {singleThesis.abstract}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-16 pt-8 border-t border-[#1A1A1A]/10 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-[0.8em] text-[#888]">© {new Date().getFullYear()} TUPT Digital Archives • Institutional Property</p>
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
                                <div
                                    key={thesis.id}
                                    onClick={() => router.push(`/search_result?id=${thesis.id}`)}
                                    className="group bg-card p-6 rounded-2xl shadow-xl border border-border-custom hover:border-primary/30 hover:shadow-2xl active:scale-[0.98] transition-all duration-300 flex flex-col h-full cursor-pointer"
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
                                    <div className="mt-auto pt-6 border-t border-white/[0.03] flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest min-w-0">
                                            <FaFileAlt className="text-primary/50 flex-shrink-0" />
                                            <span className="truncate">{thesis.id}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {currentUser?.isGraduate && String(thesis?.createdBy) !== String(currentUser?._id) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (thesis.hasRequestedCollaboration) return;
                                                        setCollaborationThesis(thesis);
                                                        setIsCollaborationModalOpen(true);
                                                    }}
                                                    disabled={thesis.hasRequestedCollaboration}
                                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all active:scale-95 group z-20 ${thesis.hasRequestedCollaboration
                                                            ? 'bg-gray-500/10 border border-gray-500/20 text-gray-500 cursor-not-allowed'
                                                            : 'bg-primary/5 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40'
                                                        }`}
                                                >
                                                    <FaHandshake className={thesis.hasRequestedCollaboration ? "" : "group-hover:rotate-12 transition-transform"} />
                                                    <span>{thesis.hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}</span>
                                                </button>
                                            )}
                                            <button className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/30 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:border-primary/50 z-20">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 mb-2">Research Recommendation Report</h2>
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

            {/* Status/Error Modal */}
            <AnimatePresence>
                {statusModal?.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-md bg-black/40 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FaRobot className="text-primary text-2xl" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Notification</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                {statusModal.message}
                            </p>

                            <button
                                onClick={() => setStatusModal(null)}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Acknowledged
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collaboration Request Modal */}
            <AnimatePresence>
                {isCollaborationModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border-custom w-full max-w-lg rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Collaboration Request</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Alumni to Undergraduate Proposal</p>
                                </div>
                                <button
                                    onClick={() => setIsCollaborationModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Message</label>
                                <textarea
                                    value={collaborationMessage}
                                    onChange={(e) => setCollaborationMessage(e.target.value)}
                                    placeholder="Explain why you want to collaborate on this thesis and how you can enhance it..."
                                    className="w-full h-40 bg-surface border border-border-custom rounded-2xl p-4 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none font-medium placeholder:text-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsCollaborationModalOpen(false)}
                                    className="py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestCollaboration}
                                    disabled={isSubmittingCollaboration || !collaborationMessage.trim()}
                                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isSubmittingCollaboration ? (
                                        <>Intelligence Sending...</>
                                    ) : (
                                        <><FaHandshake /> Send Proposal</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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