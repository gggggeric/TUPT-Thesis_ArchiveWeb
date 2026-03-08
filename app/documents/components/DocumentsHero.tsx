import React from 'react';

const DocumentsHero: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto text-center z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-tight animate-fade-in">
                Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fecaca] to-white">Analyzer</span>
            </h1>
            <p className="text-white/60 text-sm max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Upload your document to check for readability, structure, and academic quality.
            </p>
        </section>
    );
};

export default DocumentsHero;
