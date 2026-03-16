import React from 'react';
import { FaFileAlt, FaHistory, FaArrowRight, FaClock } from 'react-icons/fa';

interface Draft {
    _id: string;
    fileName: string;
    lastSaved: string;
    appliedIssueIds: string[];
    originalResults: any;
    localPagesText: any[];
}

interface DraftsListProps {
    drafts: Draft[];
    onResume: (draft: Draft) => void;
}

const DraftsList: React.FC<DraftsListProps> = ({ drafts, onResume }) => {
    if (drafts.length === 0) return null;

    return (
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <FaHistory className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Recent Analysis Drafts</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {drafts.map((draft) => (
                    <div 
                        key={draft._id}
                        onClick={() => onResume(draft)}
                        className="group bg-card/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl hover:bg-card/10 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden flex items-center gap-5"
                    >
                        <div className="w-12 h-12 bg-card/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-all">
                            <FaFileAlt className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-black text-[11px] uppercase tracking-wider truncate mb-1">
                                {draft.fileName}
                            </h4>
                            <div className="flex items-center gap-3 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                    <FaClock className="w-2 h-2" />
                                    {new Date(draft.lastSaved).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-card/10" />
                                <span className="text-amber-400/80">
                                    {Math.round((draft.appliedIssueIds.length / (draft.originalResults.totalIssues || 1)) * 100)}% Complete
                                </span>
                            </div>
                        </div>

                        <div className="p-3 bg-card/5 rounded-xl text-white/20 group-hover:text-white group-hover:bg-[#2DD4BF] transition-all">
                            <FaArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DraftsList;
