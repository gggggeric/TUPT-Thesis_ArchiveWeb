'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { FaCalendarAlt, FaFileAlt, FaUserGraduate, FaArrowLeft, FaBookOpen, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

interface Thesis {
    id?: string;
    title?: string;
    abstract?: string;
    author?: string;
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



    useEffect(() => {
        const fetchData = async () => {
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader
                onMenuPress={() => setMenuVisible(true)}
            />

            {/* Hamburger Menu */}
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Results Area */}
                    <div className="flex-1">
                        {/* Header Navigation */}
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {singleThesis ? (
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-2 text-[#8b0000] font-black uppercase tracking-widest hover:underline transition-all bg-transparent border-none cursor-pointer"
                                >
                                    <FaArrowLeft className="text-xs" /> Back to Results
                                </button>
                            ) : (
                                <Link
                                    href="/home"
                                    className="flex items-center gap-2 text-[#8b0000] font-black uppercase tracking-widest hover:underline transition-all"
                                >
                                    <FaArrowLeft className="text-xs" /> Back to Portal
                                </Link>
                            )}
                            <div className="flex flex-wrap gap-3">
                                {year && (
                                    <span className="bg-[#8b0000]/10 text-[#8b0000] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Year: {year}
                                    </span>
                                )}
                                {category && (
                                    <span className="bg-[#8b0000]/20 text-[#8b0000] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Dept: {category}
                                    </span>
                                )}
                                {query && (
                                    <span className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Search: "{query}"
                                    </span>
                                )}
                            </div>
                        </div>

                        {singleThesis ? (
                            /* Detail View */
                            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in">
                                <div className="bg-gradient-to-r from-[#8b0000] to-[#660000] p-8 md:p-12 text-white">
                                    <div className="flex items-center gap-3 mb-4 opacity-90">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                            {singleThesis.year_range || 'N/A'}
                                        </span>
                                        <span className="text-white/60">•</span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                            <FaFileAlt className="text-white/70" /> {singleThesis.id}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight drop-shadow-md">
                                        {singleThesis.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-3 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                                            <FaUserGraduate className="text-xl text-red-200" />
                                            <div>
                                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter leading-none mb-1">Lead Author / Researchers</p>
                                                <p className="font-bold text-sm tracking-wide">{extractAuthors(singleThesis)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 md:p-12">
                                    <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                        <FaBookOpen className="text-[#8b0000]" /> Abstract Summary
                                    </h2>
                                    <div className="prose prose-red max-w-none text-gray-600 leading-relaxed text-lg">
                                        {singleThesis.abstract?.split('\n').map((para, i) => (
                                            <p key={i} className="mb-4">{para}</p>
                                        ))}
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-8 items-center text-gray-400">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Filename</p>
                                            <p className="text-sm font-semibold text-gray-600">{singleThesis.filename}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Source</p>
                                            <p className="text-sm font-semibold text-gray-600">Digital Archive Module</p>
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
                                        className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-[#8b0000]/30 hover:shadow-2xl transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            {thesis.year_range && thesis.year_range.toLowerCase() !== 'unknown' ? (
                                                <span className="text-[10px] font-black text-[#8b0000] border border-[#8b0000]/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {thesis.year_range}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-wider bg-gray-50">
                                                    Unknown
                                                </span>
                                            )}
                                            <FaUserGraduate className="text-gray-200 group-hover:text-[#8b0000]/20 transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight group-hover:text-[#8b0000] transition-colors">
                                            {thesis.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed italic">
                                            {thesis.abstract?.substring(0, 150)}...
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-auto">
                                            <FaFileAlt /> {thesis.id}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaFileAlt className="text-4xl text-gray-200" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-400">No results found</h2>
                                <p className="text-gray-400 mt-2">Try adjusting your search or filters in the header.</p>
                                <Link href="/home" className="inline-block mt-8 bg-[#8b0000] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition-all">
                                    Return Home
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const SearchResultPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b0000]"></div>
            </div>
        }>
            <SearchResultContent />
        </Suspense>
    );
};

export default SearchResultPage;
