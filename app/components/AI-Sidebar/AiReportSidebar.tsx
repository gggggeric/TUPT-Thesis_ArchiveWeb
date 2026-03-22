import React from 'react';
import { FaTimes, FaRobot, FaSave } from 'react-icons/fa';

interface AiReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    query: string;
    similarity?: number;
    matchTitle?: string | null;
    recommendation: string;
    onReAnalyze?: () => void;
    onSave: () => void;
    isSaved: boolean;
    headerTitle: string;
    headerSubtitle: string;
}

const AiReportSidebar: React.FC<AiReportSidebarProps> = ({
    isOpen,
    onClose,
    query,
    similarity,
    matchTitle,
    recommendation,
    onReAnalyze,
    onSave,
    isSaved,
    headerTitle,
    headerSubtitle,
}) => {
    const accessionNumber = React.useMemo(() => `THESIS_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, [isOpen]);
    const analysisDate = React.useMemo(() => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex justify-end">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="bg-[#1E293B] w-full max-w-5xl h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative border-l border-white/10 text-white/90 flex flex-col animate-slide-in-right overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:px-10 md:py-8 border-b border-white/5 flex items-center justify-between relative z-20 bg-white/[0.02]">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-black text-white tracking-tight uppercase italic drop-shadow-sm">
                            {headerTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">{headerSubtitle}</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30 shadow-lg group hover:scale-105"
                    >
                        <FaTimes className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-8 md:p-12 relative z-10 bg-[#0F172A]/30">
                    {/* The "Paper" Document */}
                    <div className="mx-auto max-w-[850px] bg-[#FCFCFA] text-[#1A1A1A] p-12 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-h-screen relative overflow-hidden flex flex-col gap-12 border border-white/10 rounded-sm">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                            <img src="/assets/tup-logo.png" alt="" className="w-[500px] grayscale" />
                        </div>

                        {/* Paper Header */}
                        <div className="relative z-10 flex flex-col items-center text-center gap-6 border-b-[3px] border-[#1A1A1A] pb-10">
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

                        {/* Accession / Meta Row */}
                        <div className="relative z-10 flex justify-between items-end border-b border-[#1A1A1A]/10 pb-6 text-[10px]">
                            <div className="flex flex-col gap-1">
                                <span className="font-black text-[#999] uppercase tracking-widest">Accession Number</span>
                                <span className="font-bold uppercase">{accessionNumber}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-right">
                                <span className="font-black text-[#999] uppercase tracking-widest">Analysis Date</span>
                                <span className="font-bold uppercase">{analysisDate}</span>
                            </div>
                        </div>

                        {/* Report Title / Subject */}
                        <div className="relative z-10 py-8 text-center border-b-[1px] border-[#1A1A1A]/5">
                            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] leading-tight font-serif uppercase tracking-tight">
                                Strategic Research Intelligence & <br/> Recommendation Report
                            </h2>
                            <div className="mt-8 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black text-[#999] uppercase tracking-[0.5em]">Subject Query</span>
                                <p className="text-sm font-bold italic font-serif text-[#444] max-w-xl">&quot;{query}&quot;</p>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="relative z-10 space-y-14 font-serif text-[#222]">
                            {/* Similarity Section */}
                            {similarity !== undefined && (
                                <div className="border-l-4 border-[#1A1A1A] pl-8 py-2">
                                    <h5 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#666] mb-4">MATCH AUTHENTICATION</h5>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl font-black">{similarity}%</span>
                                        <span className="text-[11px] font-bold text-[#888] uppercase italic">Institutional Similarity Coefficient</span>
                                    </div>
                                    {matchTitle && (
                                        <p className="mt-4 text-sm text-[#444] leading-relaxed italic border-t border-[#1A1A1A]/5 pt-4">
                                            Reference Match: &quot;{matchTitle}&quot;
                                        </p>
                                    )}
                                </div>
                            )}                            {/* Analysis Body */}
                            <div className="space-y-12 text-[15.5px] leading-[1.8]">
                                {(() => {
                                    // Robust Section Splitter
                                    // We look for Analysis:, Improvements:, and Final Tip:
                                    const sectionMarkers = [
                                        { key: 'Analysis', regex: /(?:^|\n)(?:\**)?Analysis:(?:\**)?\s*/i },
                                        { key: 'Improvements', regex: /(?:^|\n)(?:\**)?Improvements:(?:\**)?\s*/i },
                                        { key: 'Final Tip', regex: /(?:^|\n)(?:\**)?Final Tip:(?:\**)?\s*/i }
                                    ];

                                    let rawText = recommendation.trim();
                                    const sections: { title: string, content: string[] }[] = [];

                                    // Find all marker positions
                                    const matches = sectionMarkers
                                        .map(sm => ({ sm, match: rawText.match(sm.regex) }))
                                        .filter(m => m.match)
                                        .sort((a, b) => (a.match?.index ?? 0) - (b.match?.index ?? 0));

                                    if (matches.length === 0) {
                                        // Fallback if no sections found
                                        sections.push({ title: '', content: rawText.split('\n').filter(l => l.trim()) });
                                    } else {
                                        for (let i = 0; i < matches.length; i++) {
                                            const start = (matches[i].match?.index ?? 0) + (matches[i].match?.[0].length ?? 0);
                                            const end = i < matches.length - 1 ? matches[i + 1].match?.index : rawText.length;
                                            const contentRaw = rawText.substring(start, end).trim();
                                            
                                            // Split content into lines, also handling inline bullets if they exist without newlines
                                            let contentLines = contentRaw.split('\n').filter(l => l.trim());
                                            
                                            // If it's a single block but looks like a list (has multiple * or - markers)
                                            if (contentLines.length === 1 && (contentRaw.match(/[*•-]/g)?.length ?? 0) > 1) {
                                                contentLines = contentRaw.split(/(?=\s[*•-])/).map(l => l.trim()).filter(l => l);
                                            }

                                            sections.push({
                                                title: matches[i].sm.key,
                                                content: contentLines
                                            });
                                        }
                                    }

                                    return sections.map((section, idx) => {
                                        const isMainSection = section.title !== '';
                                        
                                        return (
                                            <div key={idx} className="relative">
                                                {isMainSection ? (
                                                    <div className="space-y-6">
                                                        <h4 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                                            <span className="w-10 h-[2px] bg-[#1A1A1A]" />
                                                            {section.title}
                                                            <span className="flex-1 h-[1px] bg-[#1A1A1A]/10" />
                                                        </h4>
                                                        <div className="space-y-5">
                                                            {section.content.map((line, lIdx) => {
                                                                const trimmedLine = line.trim();
                                                                const isBullet = trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine);
                                                                const cleanLine = trimmedLine.replace(/^[-*•\d.]\s*/, '');
                                                                
                                                                return (
                                                                    <p key={lIdx} className={isBullet ? "pl-8 border-l border-[#1A1A1A]/20 italic text-[#333]" : ""}>
                                                                        {cleanLine.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => (
                                                                            part.startsWith('**') && part.endsWith('**') 
                                                                                ? <strong key={pIdx} className="font-black text-[#000]">{part.slice(2, -2).trim()}</strong> 
                                                                                : part
                                                                        ))}
                                                                    </p>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {section.content.map((line, lIdx) => {
                                                            const trimmedLine = line.trim();
                                                            // Sanitize for drop cap: find first alphanumeric
                                                            const dropCapMatch = trimmedLine.match(/[a-zA-Z]/);
                                                            const dropCap = dropCapMatch ? dropCapMatch[0] : trimmedLine.charAt(0);
                                                            const remainingText = dropCapMatch 
                                                                ? trimmedLine.substring(trimmedLine.indexOf(dropCap) + 1)
                                                                : trimmedLine.substring(1);

                                                            return (
                                                                <p key={lIdx}>
                                                                    {lIdx === 0 && idx === 0 && trimmedLine.length > 50 ? (
                                                                        <>
                                                                            <span className="float-left text-6xl font-black mr-4 mt-2 leading-[0.8] text-[#1A1A1A]">
                                                                                {dropCap}
                                                                            </span>
                                                                            {remainingText.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => (
                                                                                part.startsWith('**') && part.endsWith('**') 
                                                                                    ? <strong key={pIdx} className="font-black text-[#000]">{part.slice(2, -2).trim()}</strong> 
                                                                                    : part
                                                                            ))}
                                                                        </>
                                                                    ) : (
                                                                        trimmedLine.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => (
                                                                            part.startsWith('**') && part.endsWith('**') 
                                                                                ? <strong key={pIdx} className="font-black text-[#000]">{part.slice(2, -2).trim()}</strong> 
                                                                                : part
                                                                        ))
                                                                    )}
                                                                </p>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Paper Footer - Removed Verification Certificate as requested */}
                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-6 md:px-12 md:py-6 border-t border-white/5 bg-black/20 flex flex-col items-center gap-5 relative z-10 backdrop-blur-md">
                    <div className="flex gap-4 w-full max-w-[850px]">
                        {onReAnalyze && (
                            <button
                                onClick={onReAnalyze}
                                className="flex-1 flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95"
                            >
                                <FaRobot className="text-lg" />
                                RE-ANALYZE
                            </button>
                        )}
                        <button
                            onClick={onSave}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 active:scale-95 ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 hover:border-primary/60 shadow-lg'}`}
                        >
                            <FaSave className={isSaved ? 'text-green-400 text-lg' : 'text-primary text-lg'} />
                            {isSaved ? 'REPORT SECURED' : 'COMMIT TO ARCHIVE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiReportSidebar;
