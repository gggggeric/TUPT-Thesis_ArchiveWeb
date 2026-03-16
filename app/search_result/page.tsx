'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
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
    const [menuVisible, setMenuVisible] = useState(false);

    const [results, setResults] = useState<Thesis[]>([]);
    const [singleThesis, setSingleThesis] = useState<Thesis | null>(null);
    const [loading, setLoading] = useState(true);

    // AI Feature States
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
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
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden font-sans text-white">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DD4BF]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#2DD4BF]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

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
                                    <span className="bg-primary/40 text-teal-200 border border-primary/50/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Year: {year}
                                    </span>
                                )}
                                {category && (
                                    <span className="bg-primary/40 text-teal-200 border border-primary/50/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Dept: {category}
                                    </span>
                                )}
                                {query && (
                                    <span className="bg-primary/20 text-white border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                                        Search: "{query}"
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* AI Recommendation Feature for Search Queries */}
                        {!singleThesis && query && (
                            <div className="mb-8 bg-card rounded-2xl shadow-xl border border-border-custom overflow-hidden animate-fade-in relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-bl-full pointer-events-none -z-0" />

                                <div className="p-6 md:p-8 relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                                                <FaRobot className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-foreground tracking-tight">AI Title Recommendation</h3>
                                                <p className="text-xs text-text-dim font-medium tracking-wide">Get a professional thesis title tailored to your search</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={aiRecommendation ? () => setIsAiModalOpen(true) : handleRecommendByAi}
                                            disabled={isLoadingAi}
                                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)]`}
                                        >
                                            <FaMagic className={isLoadingAi ? 'animate-spin' : ''} />
                                            {isLoadingAi ? 'Generating Idea...' : aiRecommendation ? 'View Recommendation' : 'Recommend by AI'}
                                        </button>
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
                                    
                                    <div className="relative bg-white text-stone-900 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.4)] min-h-[850px] flex flex-col p-8 md:p-16 overflow-hidden border border-stone-200">
                                        {/* Paper Texture Overlay */}
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
                                        
                                        {/* TUP Watermark */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
                                            <img src="/assets/tup-logo.png" alt="" className="w-[500px] h-[500px] object-contain rotate-[-15deg]" />
                                        </div>

                                        {/* Corner Detail (Staple Mark) */}
                                        <div className="absolute top-8 left-8 w-12 h-4 bg-stone-200 rounded-sm -rotate-45 border border-stone-300 shadow-sm opacity-60" />

                                        {/* Institutional Letterhead */}
                                        <div className="flex flex-col items-center text-center border-b-4 border-double border-primary pb-8 mb-12 relative">
                                            <img src="/assets/tup-logo.png" alt="TUP Logo" className="w-20 h-20 mb-4 grayscale contrast-125" />
                                            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-stone-900 mb-1">Technological University of the Philippines</h4>
                                            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">Taguig City Campus</h5>
                                            <div className="w-32 h-1 bg-primary mt-6 mb-3" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400">Office of the University Registrar • Digital Research Repository</p>
                                            
                                            {/* Official Archive Stamp */}
                                            <div className="absolute top-0 right-0 rotate-[15deg] opacity-20 border-4 border-teal-700 px-4 py-2 rounded-xl text-teal-700 font-black text-xl uppercase tracking-tighter select-none">
                                                Archived
                                            </div>
                                        </div>

                                        {/* Document Content */}
                                        <div className="flex-grow flex flex-col relative z-10">
                                            <div className="flex justify-between items-center mb-16">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Accession Number</span>
                                                    <span className="text-xs font-mono font-black border-b border-stone-200">{singleThesis.id}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Certification Date</span>
                                                    <span className="text-xs font-black border-b border-stone-200">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            <div className="text-center mb-16 px-4">
                                                <h1 className="text-3xl md:text-4xl font-black text-stone-900 leading-[1.1] uppercase tracking-tight mb-8 font-serif drop-shadow-sm">
                                                    {singleThesis.title}
                                                </h1>
                                                <div className="flex items-center justify-center gap-4 mb-4">
                                                    <div className="h-px bg-border-custom flex-1" />
                                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Formal Thesis Extract</p>
                                                    <div className="h-px bg-border-custom flex-1" />
                                                </div>
                                                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-900 bg-stone-50 inline-block px-6 py-2 rounded-lg border border-stone-200">
                                                    {singleThesis.category || 'Information Technology Department'}
                                                </p>
                                            </div>

                                            <div className="mb-16">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400 mb-8 flex items-center gap-4">
                                                    Investigative Council
                                                    <div className="h-px bg-stone-100 flex-grow" />
                                                </h3>
                                                <div className="flex flex-col items-center">
                                                    <p className="text-xl md:text-2xl font-bold text-stone-900 leading-relaxed font-serif italic text-center drop-shadow-sm">
                                                        {extractAuthors(singleThesis)}
                                                    </p>
                                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">Faculty of Computing and Engineering</p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400 mb-8 flex items-center gap-4">
                                                    Executive Abstract
                                                    <div className="h-px bg-stone-100 flex-grow" />
                                                </h3>
                                                <div className="text-text-dim leading-[2] text-[16px] font-medium text-justify space-y-8 font-serif">
                                                    {singleThesis.abstract?.split('\n').map((para, i) => (
                                                        <p key={i} className={i === 0 ? "first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8] text-stone-900" : "indent-16 text-stone-800"}>
                                                            {para}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Official Integrity Mark */}
                                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <p className="text-[8px] font-black uppercase tracking-[1em] text-stone-400 mr-[-1em]">Institutional Security</p>
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
                                                <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-primary/20">
                                                    {thesis.year_range}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-500 bg-white/5 px-3 py-1 rounded-lg uppercase tracking-wider border border-white/5">
                                                    Unknown
                                                </span>
                                            )}
                                            <FaUserGraduate className="text-gray-300 group-hover:text-secondary transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-black text-foreground mb-3 line-clamp-2 leading-tight group-hover:text-teal-700 transition-colors">
                                            {thesis.title}
                                        </h3>
                                        <p className="text-sm text-text-dim line-clamp-3 mb-6 leading-relaxed font-medium">
                                            {thesis.abstract?.substring(0, 150)}...
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <FaFileAlt className="text-primary/50" /> {thesis.id}
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/30 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(45,212,191,0.1)] active:scale-95">
                                                View Thesis
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
                                <Link href="/home" className="inline-block mt-8 bg-primary/5 text-primary border border-primary/30 px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 active:scale-95">
                                    Return Home
                                </Link>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* AI Recommendation Modal */}
            {isAiModalOpen && aiRecommendation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-card rounded-[2.5rem] p-8 md:p-12 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <button
                            onClick={() => setIsAiModalOpen(false)}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-surface hover:bg-teal-50 text-gray-400 hover:text-primary rounded-full transition-colors z-10"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-8 flex-shrink-0 relative z-10">
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100">
                                <FaRobot className="text-primary text-3xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none mb-1">AI Title Recommendation</h3>
                                <p className="text-sm text-text-dim font-bold uppercase tracking-widest">Tailored to: &quot;{query}&quot;</p>
                            </div>
                        </div>

                        <div className="bg-surface border border-border-custom rounded-2xl p-6 md:p-8 shadow-inner overflow-y-auto flex-grow relative z-10 custom-scrollbar">
                            <div className="text-[15px] text-foreground font-medium leading-[1.8]">
                                {aiRecommendation.split('\n').map((line, lineIndex) => (
                                    <div key={lineIndex} className="min-h-[1.5em] mb-1">
                                        {line.replace(/^\s*\*\s/, '• ').replace(/^\s*-\s/, '• ').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i} className="font-black text-foreground text-[16px]">{part.slice(2, -2)}</strong>;
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
                                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-lg active:scale-95 ${savedPromptSuccess ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary/5 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)]'}`}
                            >
                                <FaSave className={savedPromptSuccess ? 'text-green-600 text-lg' : 'text-primary text-lg'} />
                                {savedPromptSuccess ? 'Saved Locally!' : 'Save Prompt to File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #94a3b8;
                }
            `}</style>
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
