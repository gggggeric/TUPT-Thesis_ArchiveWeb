import React from 'react';
import { FaFileAlt, FaArrowRight, FaLightbulb, FaEdit, FaTrash } from 'react-icons/fa';

interface Thesis {
    _id: string;
    title: string;
    author: string;
    year_range?: string;
    category?: string;
    isApproved: boolean;
}

interface MySubmissionsProps {
    myTheses: Thesis[];
    onViewThesis: (id: string) => void;
    onEditThesis: (thesis: Thesis) => void;
    onDeleteThesis: (id: string) => void;
    hasAnalysisOrFile: boolean;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({ myTheses, onViewThesis, onEditThesis, onDeleteThesis, hasAnalysisOrFile }) => {
    return (
        <section className="max-w-6xl mx-auto px-6 py-10 md:py-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 px-4">
                <div className="flex items-center gap-6">
                    <div className="w-1.5 h-12 bg-primary rounded-full shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
                    <div>
                        <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">Institutional Archive</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase">My Research <span className="text-primary italic">Portfolio</span></h3>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md">
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {myTheses.length} Entries
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Digital Records</span>
                </div>
            </div>

            {myTheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myTheses.map((thesis) => (
                        <div
                            key={thesis._id}
                            className="group relative bg-[#1E293B]/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-700 flex flex-col h-full overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                            
                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
                                        {thesis.category || 'General'}
                                    </span>
                                    <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border ${thesis.isApproved
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${thesis.isApproved ? 'bg-green-400 animate-pulse' : 'bg-amber-400 opacity-50'}`} />
                                        {thesis.isApproved ? 'Verified' : 'Reviewing'}
                                    </div>
                                </div>
                                <h4 className="text-[17px] font-bold text-white leading-relaxed uppercase tracking-tight mb-6 group-hover:text-primary transition-colors line-clamp-2">
                                    {thesis.title}
                                </h4>
                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-px bg-white/10" />
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                                            {thesis.author}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] ml-7 italic">
                                        FY {thesis.year_range || 'PENDING'}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => onEditThesis(thesis)}
                                        className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/20 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/20 transition-all duration-500 border border-white/5 active:scale-90"
                                        title="Edit Submission"
                                    >
                                        <FaEdit className="text-[13px]" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteThesis(thesis._id)}
                                        className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20 transition-all duration-500 border border-white/5 active:scale-90"
                                        title="Delete Submission"
                                    >
                                        <FaTrash className="text-[12px]" />
                                    </button>
                                </div>
                                <button
                                    className={`relative px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 group/btn overflow-hidden ${thesis.isApproved ? 'bg-white/[0.05] text-white hover:bg-primary/20 hover:text-primary' : 'bg-white/[0.02] text-white/20 cursor-not-allowed'}`}
                                    onClick={() => onViewThesis(thesis._id)}
                                    disabled={!thesis.isApproved}
                                >
                                    {thesis.isApproved ? (
                                        <>
                                            Explore
                                            <FaArrowRight className="text-[7px] transform transition-transform group-hover/btn:translate-x-1" />
                                        </>
                                    ) : (
                                        'Awaiting'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !hasAnalysisOrFile && (
                <div className="bg-[#1E293B]/40 backdrop-blur-2xl rounded-[3rem] p-16 md:p-24 text-center border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white/[0.02] rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/5 group-hover:border-primary/20 transition-all duration-700">
                            <FaFileAlt className="text-4xl text-white/10 group-hover:text-primary/40 transition-colors duration-700" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">No Archive Entries</h3>
                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto mb-10">
                            Your institutional records will be cataloged here.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MySubmissions;
