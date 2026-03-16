"use client";

import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaDownload, FaRedo, FaTimes, FaFileAlt, FaSearch, FaLightbulb, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

export interface AnalysisIssue {
    title: string;
    description: string;
    suggestion: string;
    suggestionType?: 'replacement';
    targetWord?: string;
    suggestedWord?: string;
    severity: 'low' | 'medium' | 'high';
    pages: number[];
    context: string;
    categoryName?: string;
    id: string;
}

export interface AnalysisCategory {
    name: string;
    color: string;
    issues: AnalysisIssue[];
}

export interface AnalysisResult {
    overallScore: number;
    totalIssues: number;
    statistics?: {
        wordCount: number;
        sentenceCount: number;
        paragraphCount: number;
        readabilityIndex: number;
    };
    categories: AnalysisCategory[];
    recommendations?: AnalysisIssue[];
    pagesText: { pageNumber: number; text: string }[];
    appliedIssueIds?: string[];
}

interface AnalysisWorkspaceProps {
    result: AnalysisResult | null;
    file: File | null;
    onClose: () => void;
}

const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({ result, file, onClose }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
    const [activePage, setActivePage] = useState<number | null>(null);
    const [selectedIssueContext, setSelectedIssueContext] = useState<string | null>(null);
    const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
    const [localPagesText, setLocalPagesText] = useState<{ pageNumber: number; text: string }[]>(result?.pagesText || []);
    const [appliedIssueIds, setAppliedIssueIds] = useState<string[]>([]);
    const [fixSuccess, setFixSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sync local state with result prop
    useEffect(() => {
        if (result?.pagesText) {
            setLocalPagesText(result.pagesText);
        }
        if (result?.appliedIssueIds) {
            setAppliedIssueIds(result.appliedIssueIds);
        }
    }, [result]);

    const saveDraft = async (retries = 3) => {
        if (!file?.name || !result) return;
        
        setIsSaving(true);
        setSaveError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/analysis-drafts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: file.name,
                    originalResults: result,
                    localPagesText,
                    appliedIssueIds
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save draft');
            }
        } catch (err) {
            console.error('Auto-save error:', err);
            if (retries > 0) {
                console.log(`Retrying save... (${retries} left)`);
                setTimeout(() => saveDraft(retries - 1), 2000);
            } else {
                setSaveError("Cloud Sync Failed (Server Offline)");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save on changes (Debounced)
    useEffect(() => {
        if (localPagesText.length === 0) return;
        
        const timer = setTimeout(() => {
            saveDraft();
        }, 2000);

        return () => clearTimeout(timer);
    }, [localPagesText, appliedIssueIds]);

    // Flatten issues and add unique IDs for stable keys
    const allIssues = result?.categories?.flatMap((cat: any) =>
        cat.issues
            .filter((issue: any) => {
                const id = `${issue.title}-${issue.context}`.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
                return !appliedIssueIds.includes(id);
            })
            .map((issue: any) => ({
                ...issue,
                categoryName: cat.name,
                id: `${issue.title}-${issue.context}`.replace(/[^a-z0-9]/gi, '-').substring(0, 50)
            }))
    ) || (result as any)?.recommendations?.map((issue: any) => ({
        ...issue,
        categoryName: issue.category,
        id: `${issue.title}-${issue.context}`.replace(/[^a-z0-9]/gi, '-').substring(0, 50)
    })) || [];

    const getIssueId = (issue: any) => {
        return issue.id || `${issue.title}-${issue.context}`.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
    };

    const activeCategories = result?.categories
        ?.map((cat: any) => ({
            ...cat,
            issues: cat.issues.filter((issue: any) => {
                const id = getIssueId(issue);
                return !appliedIssueIds.includes(id);
            })
        }))
        .filter((cat: any) => cat.issues.length > 0) || [];

    const totalFixesApplied = appliedIssueIds.length;
    const initialTotalIssues = result?.totalIssues || 0;
    const progressPercentage = initialTotalIssues > 0 ? Math.round((totalFixesApplied / initialTotalIssues) * 100) : 0;

    // Auto-expand first category with issues
    useEffect(() => {
        if (result?.categories) {
            const firstIdx = result.categories.findIndex(cat => cat.issues.length > 0);
            if (firstIdx !== -1) {
                setExpandedCategories({ [firstIdx]: true });
            }
        }
    }, [result]);

    const getIssueColor = (categoryName: string) => {
        switch (categoryName) {
            case 'Structure': return '#f59e0b'; // Amber
            case 'Writing Style': return '#3b82f6'; // Blue
            case 'Academic Style': return '#8b5cf6'; // Purple
            case 'Grammar & Style': return '#ef4444'; // Red
            default: return '#2DD4BF';
        }
    };

    const getIssueTailwindColor = (categoryName: string) => {
        switch (categoryName) {
            case 'Structure': return 'amber';
            case 'Writing Style': return 'blue';
            case 'Academic Style': return 'purple';
            case 'Grammar & Style': return 'red';
            default: return 'red';
        }
    };

    const getIssueStyles = (categoryName: string, isSelected: boolean) => {
        const color = getIssueTailwindColor(categoryName);
        if (color === 'amber') {
            return isSelected ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-500/20' : 'border-amber-400/60 hover:bg-amber-50';
        }
        if (color === 'blue') {
            return isSelected ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-500/20' : 'border-blue-400/60 hover:bg-card/40';
        }
        if (color === 'purple') {
            return isSelected ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-500/20' : 'border-purple-400/60 hover:bg-card/40';
        }
        return isSelected ? 'bg-teal-100 border-teal-600 ring-2 ring-teal-500/20' : 'border-teal-400/60 hover:bg-teal-50';
    };

    const getIssueCardIconBg = (categoryName: string) => {
        const color = getIssueTailwindColor(categoryName);
        if (color === 'amber') return 'bg-amber-50 text-amber-600';
        if (color === 'blue') return 'bg-card/40 text-blue-600';
        if (color === 'purple') return 'bg-card/40 text-purple-600';
        return 'bg-teal-50 text-primary';
    };

    const getIssueBadgeStyles = (categoryName: string) => {
        const color = getIssueTailwindColor(categoryName);
        if (color === 'amber') return 'bg-amber-600';
        if (color === 'blue') return 'bg-blue-600';
        if (color === 'purple') return 'bg-purple-600';
        return 'bg-primary';
    };

    const getCategoryIcon = (categoryName: string) => {
        switch (categoryName) {
            case 'Structure': return <FaFileAlt className="w-2 h-2" />;
            case 'Writing Style': return <FaLightbulb className="w-2 h-2" />;
            case 'Academic Style': return <FaLightbulb className="w-2 h-2" />;
            case 'Grammar & Style': return <FaSearch className="w-2 h-2" />;
            default: return <FaSearch className="w-2 h-2" />;
        }
    };

    useEffect(() => {
        if (result?.categories) {
            console.log('--- ANALYSIS RESULTS ---');
            console.log('Total Issues:', result.totalIssues);
            console.log('Category Count:', result.categories.length);
            console.log('--- END ANALYSIS LOG ---');
        }
    }, [result]);

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

    const jumpToPage = (pageNum: number, context?: string, issueId?: string) => {
        setActivePage(pageNum);
        setSelectedIssueContext(context || null);
        if (issueId) setHoveredIssueId(issueId);

        setTimeout(() => {
            const elementId = issueId ? `highlight-${issueId}` : `page-${pageNum}`;
            const el = document.getElementById(elementId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const pageEl = document.getElementById(`page-${pageNum}`);
                if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    };

    const applySuggestion = (issue: AnalysisIssue) => {
        if (!issue.targetWord || !issue.suggestedWord) return;
        const issueId = getIssueId(issue);

        const newPages = localPagesText.map(page => {
            if (issue.pages.includes(page.pageNumber)) {
                // Escape special characters but allow \s+ for any whitespace (very important for PDF/DOCX text)
                const safeContext = issue.context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
                const contextRegex = new RegExp(safeContext, 'g');

                const newText = page.text.replace(contextRegex, (match) => {
                    // Replace the target word within this specific context
                    // Use a more flexible word boundary that handles phrases better
                    const safeTarget = issue.targetWord!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
                    const targetRegex = new RegExp(`(?<!\\w)${safeTarget}(?!\\w)`, 'gi');
                    return match.replace(targetRegex, issue.suggestedWord!);
                });
                return { ...page, text: newText };
            }
            return page;
        });

        setLocalPagesText(newPages);
        setAppliedIssueIds(prev => [...prev, issueId]);
        setFixSuccess(`Replaced "${issue.targetWord}" with "${issue.suggestedWord}"`);
        setTimeout(() => setFixSuccess(null), 3000);
    };

    const dismissIssue = (issueId: string) => {
        setAppliedIssueIds(prev => [...prev, issueId]);
        setFixSuccess(`Issue dismissed.`);
        setTimeout(() => setFixSuccess(null), 3000);
    };

    const handleDownloadRefined = () => {
        if (!file) return;
        const fullContent = localPagesText.map(p => `--- Page ${p.pageNumber} ---\n\n${p.text}`).join('\n\n');
        const blob = new Blob([fullContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Refined_Manuscript_${file.name.split('.')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setFixSuccess("Refined manuscript downloaded!");
        setTimeout(() => setFixSuccess(null), 3000);
    };

    const scrollToSidebarIssue = (issueId: string) => {
        const categories = result?.categories || [];
        const catIndex = categories.findIndex(c => c.issues.some(i => {
            const id = getIssueId(i);
            return id === issueId;
        }));

        if (catIndex !== -1) {
            setExpandedCategories(prev => ({ ...prev, [catIndex]: true }));
            setTimeout(() => {
                const el = document.getElementById(`issue-card-${issueId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        // Only create object URL if it's a real File/Blob instance
        if (file && ((file as any) instanceof Blob || (file as any) instanceof File)) {
            try {
                const url = URL.createObjectURL(file);
                setFileUrl(url);
                return () => URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Error creating object URL:', err);
                setFileUrl(null);
            }
        } else {
            setFileUrl(null);
        }
    }, [file]);

    if (!result || !file) return null;

    return (
        <section className="max-w-[1700px] mx-auto px-6 py-6 relative z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Analysis Workspace</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2DD4BF]">Analysis View</p>
                </div>
                <div className="flex items-center gap-4">
                    {isSaving && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-card/5 rounded-full border border-white/5 backdrop-blur-sm animate-fade-in">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/80">Saving progress...</span>
                        </div>
                    )}
                    {saveError && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 rounded-full border border-teal-500/20 backdrop-blur-sm animate-fade-in">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{saveError}</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-full bg-card/10 text-white font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-card/20 border border-white/10 flex items-center gap-2 transition-all backdrop-blur-md"
                    >
                        <FaTimes /> Close Workspace
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 lg:h-[85vh] lg:min-h-[850px]">
                {/* Left Panel - Native Text Editor View */}
                <div className="bg-card/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/20 flex flex-col relative h-[600px] lg:h-auto">
                    <div className="bg-card/5 px-6 md:px-8 py-5 border-b border-white/10 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <FaFileAlt className="text-white/60" />
                            <span className="text-xs font-black uppercase tracking-widest text-white line-clamp-1">{file.name}</span>
                        </div>
                        {fileUrl && (
                            <a
                                href={fileUrl}
                                download={file.name}
                                className="bg-card/10 border border-white/10 text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                title="Download Original PDF"
                            >
                                <FaDownload className="text-[10px]" /> Original
                            </a>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-black/20 p-6 md:p-10 lg:p-20 custom-scrollbar relative">
                        {fixSuccess && (
                            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-card/400 text-white px-8 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce-subtle font-black uppercase text-[10px] tracking-widest">
                                <FaCheckCircle />
                                {fixSuccess}
                            </div>
                        )}
                        <div className="max-w-4xl mx-auto bg-white p-6 md:p-12 lg:p-20 rounded shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-stone-200 min-h-full mb-[30vh]">
                            {localPagesText.length > 0 ? (
                                localPagesText.map((page, idx) => (
                                    <div
                                        key={idx}
                                        id={`page-${page.pageNumber}`}
                                        className={`mb-32 relative transition-all duration-700 ${activePage === page.pageNumber ? 'border-l-4 border-[#2DD4BF] pl-6 -ml-6' : ''}`}
                                    >
                                        {/* Page Header Indicator */}
                                        <div className="flex items-center gap-4 mb-10 opacity-60 select-none">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Page {page.pageNumber}</span>
                                            <div className="h-px flex-1 bg-stone-100" />
                                        </div>

                                        <div className="absolute -left-12 top-12 text-[9px] font-black text-stone-300 select-none hidden md:block border-b border-stone-200 w-8 text-right pr-2">
                                            {page.pageNumber}
                                        </div>
                                        {/* Render paragraph chunks */}
                                        <div className="font-serif text-stone-800 text-lg leading-[1.8] text-justify whitespace-pre-wrap">
                                            {(() => {
                                                let parts: (string | React.ReactNode)[] = [page.text];

                                                const sortedIssues = [...allIssues]
                                                    .filter(i => i.context && i.pages?.includes(page.pageNumber))
                                                    .sort((a, b) => (b.context?.length || 0) - (a.context?.length || 0));

                                                sortedIssues.forEach(issue => {
                                                    const context = issue.context!;
                                                    const isSelected = selectedIssueContext === context;
                                                    const isHovered = hoveredIssueId === issue.id;

                                                    const newParts: (string | React.ReactNode)[] = [];
                                                    parts.forEach(part => {
                                                        if (typeof part !== 'string') {
                                                            newParts.push(part);
                                                            return;
                                                        }

                                                        const escapedContext = context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
                                                        const regex = new RegExp(`(${escapedContext})`, 'gi');
                                                        const subParts = part.split(regex);

                                                        subParts.forEach((subPart, subIndex) => {
                                                            if (regex.test(subPart)) {
                                                                newParts.push(
                                                                    <span
                                                                        key={`${issue.id}-${subIndex}`}
                                                                        id={`highlight-${issue.id}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            console.log('Clicked highlight:', issue.title);
                                                                            setSelectedIssueContext(context);
                                                                            scrollToSidebarIssue(issue.id);
                                                                        }}
                                                                        onMouseEnter={() => setHoveredIssueId(issue.id)}
                                                                        onMouseLeave={() => setHoveredIssueId(null)}
                                                                        className={`cursor-pointer transition-all duration-300 border-b-2 ${getIssueStyles(issue.categoryName!, isSelected || isHovered)} px-0.5 rounded-sm relative z-10`}
                                                                        title={`${issue.categoryName}: ${issue.title}`}
                                                                    >
                                                                        {issue.suggestionType === 'replacement' && issue.targetWord ? (
                                                                            <span className="relative">
                                                                                {subPart.split(new RegExp(`(\\b${issue.targetWord}\\b)`, 'gi')).map((chunk, ci) => (
                                                                                    chunk.toLowerCase() === issue.targetWord?.toLowerCase() ? (
                                                                                        <span
                                                                                            key={ci}
                                                                                            className="bg-blue-600/10 border-b-2 border-blue-600 text-blue-800 font-black px-1 rounded-sm inline-block shadow-[0_2px_10px_rgba(37,99,235,0.15)] hover:bg-blue-600/20 transition-colors relative group/word"
                                                                                        >
                                                                                            {chunk}
                                                                                            {/* Suggestion Pill */}
                                                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover/word:scale-100 transition-all bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                                                                                                Suggest → {issue.suggestedWord}
                                                                                            </span>
                                                                                        </span>
                                                                                    ) : chunk
                                                                                ))}
                                                                            </span>
                                                                        ) : subPart}

                                                                        {(isSelected || isHovered) && (
                                                                            <span className={`absolute -top-6 right-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter text-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap animate-fade-in z-30 pointer-events-none ${getIssueBadgeStyles(issue.categoryName!)}`}>
                                                                                {getCategoryIcon(issue.categoryName!)}
                                                                                {issue.categoryName}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            } else if (subPart) {
                                                                newParts.push(subPart);
                                                            }
                                                        });
                                                    });
                                                    parts = newParts;
                                                });

                                                return parts;
                                            })()}
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

                            {result.pagesText && result.pagesText.length > 0 && (
                                <div className="mt-32 pt-12 border-t border-border-custom flex flex-col items-center opacity-30 select-none">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-px w-12 bg-gray-300" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">End of Analysis</span>
                                        <div className="h-px w-12 bg-gray-300" />
                                    </div>
                                    <FaFileAlt className="text-xl" />
                                </div>
                            )}
                        </div>

                        {/* Floating Page Indicator */}
                        {result.pagesText && result.pagesText.length > 0 && activePage && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl z-20 flex items-center gap-4 animate-bounce-subtle">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                    Page {activePage} of {result.pagesText.length}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Analysis Findings */}
                <div className="bg-card/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20 flex flex-col overflow-hidden h-[600px] lg:h-auto">
                    {/* Header Score */}
                    <div className="px-6 md:px-10 py-6 md:py-8 border-b border-white/10 bg-card/5 flex flex-col gap-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-card/10 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                                <span className="text-2xl font-black text-[#2DD4BF]">{result.overallScore}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase">Overall Assessment</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                    Status: <span className="text-[#2DD4BF]">{getScoreLabel(result.overallScore || 0)}</span>
                                </p>
                            </div>
                        </div>

                        {allIssues.length > 0 && (
                            <div className="bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
                                <FaLightbulb className="text-amber-400 animate-bounce" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                                    {allIssues.length} Recommendations Found – See Below
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-transparent custom-scrollbar">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[
                                { label: 'Active Issues', value: allIssues.length, color: 'text-[#2DD4BF]' },
                                { label: 'Fixes Applied', value: totalFixesApplied, color: 'text-white' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-card/5 rounded-2xl p-5 border border-white/10">
                                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-10 bg-card/5 rounded-2xl p-5 border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Resolution Progress</p>
                                <p className="text-[10px] text-white font-black">{progressPercentage}%</p>
                            </div>
                            <div className="w-full h-2 bg-card/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#af1a1a] transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Detailed Findings */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
                                <span className="h-px flex-1 bg-card/10" />
                                Feedback
                                <span className="h-px flex-1 bg-card/10" />
                            </h4>

                            {activeCategories.map((category: any, idx: number) => (
                                <div key={idx} className="border border-white/10 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        className="w-full px-8 py-5 flex items-center justify-between bg-card/5 hover:bg-card/10 transition-colors border-b border-white/5"
                                        onClick={() => toggleCategory(idx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <h4 className="font-black text-xs text-white uppercase tracking-widest">{category.name}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-card/10 text-white/60 px-3 py-1 rounded-full border border-white/10">
                                                {category.issues.length} {category.issues.length === 1 ? 'Issue' : 'Issues'}
                                            </span>
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            {expandedCategories[idx] ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </button>

                                    {expandedCategories[idx] && (
                                        <div className="bg-black/20 p-6 space-y-6">
                                            {category.issues.map((issue: AnalysisIssue, i: number) => {
                                                const issueId = getIssueId(issue);
                                                const isSelected = selectedIssueContext === issue.context || hoveredIssueId === issueId;

                                                return (
                                                    <div
                                                        key={i}
                                                        id={`issue-card-${issueId}`}
                                                        className={`bg-card rounded-[1.5rem] p-6 border-2 transition-all duration-500 relative overflow-hidden cursor-pointer group ${isSelected ? 'border-[#2DD4BF] shadow-xl shadow-black/10 scale-[1.02] z-10' : 'border-transparent shadow-sm hover:shadow-md'}`}
                                                        onClick={() => {
                                                            if (issue.pages && issue.pages.length > 0) {
                                                                jumpToPage(issue.pages[0], issue.context, issueId);
                                                            }
                                                        }}
                                                        onMouseEnter={() => setHoveredIssueId(issueId)}
                                                        onMouseLeave={() => setHoveredIssueId(null)}
                                                    >
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${issue.severity === 'high' ? 'bg-[#2DD4BF]'
                                                            : issue.severity === 'medium' ? 'bg-amber-500'
                                                                : 'bg-card/400'
                                                            }`} />
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-xl scale-75 ${getIssueCardIconBg(category.name)}`}>
                                                                    {getCategoryIcon(category.name)}
                                                                </div>
                                                                <h4 className="text-foreground font-black text-xs uppercase tracking-tight">{issue.title}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        dismissIssue(issueId);
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-[#2DD4BF] hover:bg-teal-50 rounded-lg transition-all"
                                                                    title="Dismiss Suggestion"
                                                                >
                                                                    <FaTimes className="w-2.5 h-2.5" />
                                                                </button>
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shrink-0 ${issue.severity === 'high'
                                                                    ? 'bg-teal-50 text-primary border-teal-100'
                                                                    : issue.severity === 'medium'
                                                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                                        : 'bg-card/40 text-blue-600 border-border-custom'
                                                                    }`}>
                                                                    {issue.severity}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <p className="text-xs text-text-dim font-medium leading-relaxed">{issue.description}</p>

                                                            <div className={`bg-surface rounded-2xl p-5 border border-border-custom transition-colors ${isSelected ? 'bg-amber-50/50 border-amber-100' : ''}`}>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="p-1 px-2 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                                        <FaLightbulb className="w-2.5 h-2.5" />
                                                                        Grammarly Recommendation
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-foreground leading-relaxed font-semibold mb-4 italic">
                                                                    "{issue.suggestion}"
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {issue.suggestionType === 'replacement' ? (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                applySuggestion(issue);
                                                                            }}
                                                                            className="flex items-center gap-2 bg-[#2DD4BF] text-white text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2DD4BF]/20"
                                                                        >
                                                                            <FaCheckCircle className="w-3 h-3" />
                                                                            Apply Academic Fix
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                dismissIssue(issueId);
                                                                            }}
                                                                            className="flex items-center gap-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
                                                                        >
                                                                            <FaCheckCircle className="w-3 h-3 text-green-400" />
                                                                            Mark as Resolved
                                                                        </button>
                                                                    )}
                                                                    {issue.pages?.map(page => (
                                                                        <button
                                                                            key={page}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                jumpToPage(page, issue.context, issueId);
                                                                            }}
                                                                            className={`group flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl border active:scale-95 ${activePage === page && selectedIssueContext === issue.context ? 'bg-primary text-white border-primary' : 'bg-card hover:bg-surface text-gray-400 hover:text-foreground border-border-custom'}`}
                                                                        >
                                                                            Go to p{page}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {category.issues.length === 0 && (
                                                <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 py-4">No issues found in this category</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Download Action Footer */}
                    <div className="px-6 md:px-10 py-6 border-t border-white/10 bg-card/5 backdrop-blur-md">
                        <button
                            onClick={handleDownloadRefined}
                            disabled={appliedIssueIds.length === 0}
                            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${appliedIssueIds.length > 0 ? 'bg-[#2DD4BF] text-white hover:bg-primary shadow-[#2DD4BF]/20' : 'bg-card/5 text-white/20 border border-white/5 cursor-not-allowed'}`}
                        >
                            <FaDownload className={appliedIssueIds.length > 0 ? 'animate-bounce' : ''} />
                            Download Refined Manuscript
                        </button>
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
