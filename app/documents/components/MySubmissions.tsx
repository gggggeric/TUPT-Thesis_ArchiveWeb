import React from 'react';
import { FaFileAlt, FaArrowRight, FaLightbulb } from 'react-icons/fa';

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
    hasAnalysisOrFile: boolean;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({ myTheses, onViewThesis, hasAnalysisOrFile }) => {
    return (
        <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <span className="w-2 h-10 bg-[#8b0000] rounded-full" />
                    <div>
                        <h2 className="text-sm font-black text-white tracking-[0.3em] uppercase opacity-60">My Submissions</h2>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase mt-1">My Research Entries</h3>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#fecaca] bg-white/5 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    {myTheses.length} Submissions
                </span>
            </div>

            {myTheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myTheses.map((thesis) => (
                        <div
                            key={thesis._id}
                            className="group bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl shadow-black/20 hover:border-white/30 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black text-[#fecaca] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                        {thesis.category || 'General'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${thesis.isApproved
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {thesis.isApproved ? 'Approved' : 'Pending Review'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-white leading-[1.3] uppercase tracking-tight mb-4 group-hover:text-[#fecaca] transition-colors line-clamp-2">
                                    {thesis.title}
                                </h4>
                                <p className="text-[11px] text-white/40 font-bold uppercase tracking-[0.1em] mb-4">
                                    {thesis.author} &bull; {thesis.year_range || 'Unknown Year'}
                                </p>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-[#8b0000] transition-all duration-500 border border-white/10">
                                    <FaFileAlt className="text-sm" />
                                </div>
                                <button
                                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-20 text-center border border-white/10 shadow-2xl shadow-black/20">
                    <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10">
                        <FaLightbulb className="text-3xl text-white/20" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No submissions detected</h3>
                    <p className="text-sm text-white/40 font-medium max-w-sm mx-auto mb-8">
                        Your uploaded documents will appear here.
                    </p>
                </div>
            )}
        </section>
    );
};

export default MySubmissions;
