'use client';

import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-16 bg-white/5 backdrop-blur-md border-t border-white/10 relative z-10 w-full overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#8b0000]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.5em] text-center">
                            Technological University of the Philippines &bull; Taguig
                        </p>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.3em] text-center">
                            Institutional Thesis Archive &copy; {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="h-px w-12 bg-white/10" />
                        <div className="flex gap-6">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors cursor-default">
                                Build v1.2.0
                            </span>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/40 transition-colors cursor-default">
                                SECURE PORTAL
                            </span>
                        </div>
                        <div className="h-px w-12 bg-white/10" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
