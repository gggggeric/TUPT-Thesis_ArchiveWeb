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
                        <h2 className="text-sm font-black text-gray-500 tracking-[0.3em] uppercase">My Submissions</h2>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mt-1">My Research Entries</h3>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50 px-5 py-2 rounded-full border border-red-100">
                    {myTheses.length} Submissions
                </span>
            </div>

            {myTheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myTheses.map((thesis) => (
                        <div
                            key={thesis._id}
                            className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl hover:shadow-2xl hover:border-red-200 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex-grow">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                        {thesis.category || 'General'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${thesis.isApproved
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {thesis.isApproved ? 'Approved' : 'Pending Review'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-gray-900 leading-[1.3] uppercase tracking-tight mb-4 group-hover:text-red-700 transition-colors line-clamp-2">
                                    {thesis.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.1em] mb-4">
                                    {thesis.author} &bull; {thesis.year_range || 'Unknown Year'}
                                </p>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-700 transition-all duration-500 border border-gray-100">
                                    <FaFileAlt className="text-sm" />
                                </div>
                                <button
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-xl">
                    <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100">
                        <FaLightbulb className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">No submissions detected</h3>
                    <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mb-8">
                        Your uploaded documents will appear here.
                    </p>
                </div>
            )}
        </section>
    );
};

export default MySubmissions;
