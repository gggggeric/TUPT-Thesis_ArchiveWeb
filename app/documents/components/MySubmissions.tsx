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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <span className="w-2 h-10 bg-[#2DD4BF] rounded-full" />
                    <div>
                        <h2 className="text-sm font-black text-white/50 tracking-[0.3em] uppercase">My Submissions</h2>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase mt-1">My Research Entries</h3>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-5 py-2 rounded-full border border-teal-100">
                    {myTheses.length} Submissions
                </span>
            </div>

            {myTheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myTheses.map((thesis) => (
                        <div
                            key={thesis._id}
                            className="group bg-card rounded-[2.5rem] border border-border-custom p-8 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                                        {thesis.category || 'General'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${thesis.isApproved
                                        ? 'bg-card/40 text-green-600 border-border-custom'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {thesis.isApproved ? 'Approved' : 'Pending Review'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-foreground leading-[1.3] uppercase tracking-tight mb-4 group-hover:text-teal-700 transition-colors line-clamp-2">
                                    {thesis.title}
                                </h4>
                                <p className="text-[11px] text-text-dim font-bold uppercase tracking-[0.1em] mb-4">
                                    {thesis.author} &bull; {thesis.year_range || 'Unknown Year'}
                                </p>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-border-custom flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onEditThesis(thesis)}
                                        className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all duration-300 border border-border-custom"
                                        title="Edit Submission"
                                    >
                                        <FaEdit className="text-xs" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteThesis(thesis._id)}
                                        className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-primary transition-all duration-300 border border-border-custom"
                                        title="Delete Submission"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                                <button
                                    className="text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-foreground transition-colors flex items-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => onViewThesis(thesis._id)}
                                    disabled={!thesis.isApproved}
                                >
                                    {thesis.isApproved ? 'View' : 'Pending'}
                                    <FaArrowRight className={`text-[8px] transform transition-transform ${thesis.isApproved ? 'group-hover:translate-x-1' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !hasAnalysisOrFile && (
                <div className="bg-card rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-20 text-center border border-border-custom shadow-xl">
                    <div className="w-20 h-20 bg-surface rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 border border-border-custom">
                        <FaLightbulb className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">No submissions detected</h3>
                    <p className="text-sm text-text-dim font-medium max-w-sm mx-auto mb-8">
                        Your uploaded documents will appear here.
                    </p>
                </div>
            )}
        </section>
    );
};

export default MySubmissions;
