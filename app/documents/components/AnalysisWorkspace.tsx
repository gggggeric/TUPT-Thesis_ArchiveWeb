import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaDownload, FaRedo, FaTimes, FaFileAlt } from 'react-icons/fa';

export interface AnalysisIssue {
    title: string;
    description: string;
    suggestion: string;
    severity: string;
    pages?: number[];
}

export interface AnalysisCategory {
    name: string;
    color: string;
    issues: AnalysisIssue[];
}

export interface AnalysisResult {
    overallScore?: number;
    totalIssues?: number;
    wordCount?: number;
    sentenceCount?: number;
    paragraphCount?: number;
    categories?: AnalysisCategory[];
    pagesText?: { pageNumber: number, text: string }[];
}

interface AnalysisWorkspaceProps {
    result: AnalysisResult | null;
    file: File | null;
    onClose: () => void;
}

const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({ result, file, onClose }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [activePage, setActivePage] = useState<number | null>(null);

    const toggleCategory = (index: number) => {
        setExpandedCategories(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Exceptional';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Acceptable';
        return 'Needs Revision';
    };

    const jumpToPage = (pageNum: number) => {
        setActivePage(pageNum);
        const el = document.getElementById(`page-${pageNum}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (!result || !file) return null;

    const fileUrl = URL.createObjectURL(file);

    return (
        <section className="max-w-[1600px] mx-auto px-6 py-12 relative z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Analysis Workspace</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fecaca]">Analysis View</p>
                </div>
                <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-white/20 border border-white/10 flex items-center gap-2 transition-all backdrop-blur-md"
                >
                    <FaTimes /> Close Workspace
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[80vh] min-h-[800px]">
                {/* Left Panel - Native Text Editor View */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/20 flex flex-col relative">
                    <div className="bg-white/5 px-8 py-5 border-b border-white/10 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <FaFileAlt className="text-white/60" />
                            <span className="text-xs font-black uppercase tracking-widest text-white line-clamp-1">{file.name}</span>
                        </div>
                        <a
                            href={fileUrl}
                            download={file.name}
                            className="bg-white/10 border border-white/10 text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            title="Download Original PDF"
                        >
                            <FaDownload className="text-[10px]" /> Original
                        </a>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-black/20 p-10 md:p-14 custom-scrollbar relative">
                        <div className="max-w-3xl mx-auto bg-white p-12 md:p-16 rounded shadow-xl border border-gray-100 min-h-full">
                            {result.pagesText && result.pagesText.length > 0 ? (
                                result.pagesText.map((page, idx) => (
                                    <div
                                        key={idx}
                                        id={`page-${page.pageNumber}`}
                                        className={`mb-20 relative transition-all duration-700 ${activePage === page.pageNumber ? 'bg-amber-100/50 -mx-6 px-6 py-6 border-l-4 border-amber-500 rounded-r-2xl shadow-lg ring-1 ring-amber-500/20' : ''}`}
                                    >
                                        <div className="absolute -left-12 top-1 text-[9px] font-black text-gray-300 select-none hidden md:block border-b border-gray-200 w-8 text-right pr-2">
                                            {page.pageNumber}
                                        </div>
                                        {/* Render paragraph chunks */}
                                        <div className="font-serif text-gray-800 text-lg leading-[1.8] text-justify">
                                            {page.text.split('\n').map((para, i) => {
                                                if (!para.trim()) return <br key={i} />;
                                                return <p key={i} className="mb-4">{para}</p>;
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <FaFileAlt className="text-5xl mb-4 text-gray-200" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No text extracted.</p>
                                    <p className="text-xs mt-2">Could not parse readable text from this document.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Analysis Findings */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20 flex flex-col overflow-hidden">
                    {/* Header Score */}
                    <div className="px-10 py-8 border-b border-white/10 bg-white/5 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                            <span className="text-2xl font-black text-[#fecaca]">{result.overallScore}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Overall Assessment</h3>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                Status: <span className="text-[#fecaca]">{getScoreLabel(result.overallScore || 0)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 bg-transparent custom-scrollbar">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {[
                                { label: 'Total Issues', value: result.totalIssues, color: 'text-[#fecaca]' },
                                { label: 'Words / Stats', value: result.wordCount, color: 'text-white' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed Findings */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                <span className="h-px flex-1 bg-white/10" />
                                Feedback
                                <span className="h-px flex-1 bg-white/10" />
                            </h4>

                            {result.categories?.map((category, idx) => (
                                <div key={idx} className="border border-white/10 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        className="w-full px-8 py-5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5"
                                        onClick={() => toggleCategory(idx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <h4 className="font-black text-xs text-white uppercase tracking-widest">{category.name}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/60 px-3 py-1 rounded-full border border-white/10">
                                                {category.issues.length} {category.issues.length === 1 ? 'Issue' : 'Issues'}
                                            </span>
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            {expandedCategories[idx] ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </button>

                                    {expandedCategories[idx] && (
                                        <div className="bg-black/20 p-6 space-y-6">
                                            {category.issues.map((issue, i) => (
                                                <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-sm relative overflow-hidden group hover:border-white/20 transition-colors">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${issue.severity === 'high' ? 'bg-[#8b0000]'
                                                        : issue.severity === 'medium' ? 'bg-amber-500'
                                                            : 'bg-blue-500'
                                                        }`} />

                                                    <div className="flex items-start justify-between gap-4 mb-3 pl-4">
                                                        <h5 className="font-black text-white tracking-tight uppercase text-xs leading-relaxed">{issue.title}</h5>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shrink-0 ${issue.severity === 'high'
                                                            ? 'bg-[#8b0000]/20 text-[#fecaca] border-[#8b0000]/40'
                                                            : issue.severity === 'medium'
                                                                ? 'bg-amber-500/10 text-amber-200 border-amber-500/20'
                                                                : 'bg-blue-500/10 text-blue-200 border-blue-500/20'
                                                            }`}>
                                                            {issue.severity} Severity
                                                        </span>
                                                    </div>

                                                    <div className="pl-4 space-y-4">
                                                        <p className="text-xs text-white/60 font-medium leading-relaxed">{issue.description}</p>

                                                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                            <p className="text-[9px] font-black text-[#fecaca] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <FaRedo className="text-[8px]" /> Suggested Action
                                                            </p>
                                                            <p className="text-xs text-white/80 font-medium">{issue.suggestion}</p>
                                                        </div>

                                                        {issue.pages && issue.pages.length > 0 && (
                                                            <div className="pt-2 pl-4">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {issue.pages.map(page => (
                                                                        <button
                                                                            key={page}
                                                                            onClick={() => jumpToPage(page)}
                                                                            className={`text-[9px] font-black uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg shadow-sm border active:scale-95 ${activePage === page ? 'bg-[#8b0000] text-white border-[#8b0000]' : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white border-white/10'}`}
                                                                        >
                                                                            Locate on Page {page}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {category.issues.length === 0 && (
                                                <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 py-4">No issues found in this category</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimal CSS block to customize internal scrollbar */}
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
        </section>
    );
};

export default AnalysisWorkspace;
