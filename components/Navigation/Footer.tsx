'use client';

import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-12 bg-gradient-to-r from-[#8b0000] to-[#660000] text-center border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-8">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.4em]">
                    Technological University of the Philippines &bull; Taguig &copy; {new Date().getFullYear()}
                </p>
                <div className="mt-4 flex justify-center gap-6 opacity-30 text-white/50">
                    <span className="text-[9px] font-black uppercase tracking-widest">Build v1.2.0</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">SECURE PORTAL</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
