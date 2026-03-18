import React from 'react';
import { FaBrain, FaFileAlt, FaSearch } from 'react-icons/fa';

const HowItWorks: React.FC = () => {
    return (
        <section className="relative px-6 max-w-5xl mx-auto mb-20 z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">How it Works</h2>
                <div className="w-12 h-1 bg-[#2DD4BF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        icon: <FaFileAlt className="text-2xl text-[#2DD4BF]" />,
                        title: "Smart Extraction",
                        desc: "Our 'Digital Readers' carefully scan your PDF or DOCX, preserving every sentence and page layout precisely.",
                        tech: "Powered by mammoth & pdf-parse"
                    },
                    {
                        icon: <FaBrain className="text-2xl text-[#2DD4BF]" />,
                        title: "Academic Style Audit",
                        desc: "An AI-powered professional editor reviews your tone, word choice, and complex sentence structures.",
                        tech: "Powered by Gemini 1.5 Flash"
                    },
                    {
                        icon: <FaSearch className="text-2xl text-[#2DD4BF]" />,
                        title: "Readability Check",
                        desc: "We calculate the Flesch-Kincaid Grade to ensure your research meets institutional standards.",
                        tech: "Powered by text-readability"
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-card/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-card/10 transition-all group shadow-sm hover:shadow-xl hover:shadow-[#2DD4BF]/5">
                        <div className="mb-6 bg-card/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <h3 className="text-white font-black uppercase text-sm mb-3 tracking-widest">{item.title}</h3>
                        <p className="text-white/60 text-[11px] font-medium leading-relaxed mb-6">
                            {item.desc}
                        </p>
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#2DD4BF] opacity-60">
                            {item.tech}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Real-time analysis, professional results.
                </p>
            </div>
        </section>
    );
};

export default HowItWorks;
