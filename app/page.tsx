'use client';

import { useRouter } from 'next/navigation';
import {
  FaFileAlt,
  FaLightbulb,
  FaChartLine,
  FaArrowRight,
  FaShieldAlt,
  FaUserPlus,
  FaSignInAlt,
  FaChevronDown,
  FaSearch,
  FaCheckCircle,
  FaRocket
} from 'react-icons/fa';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import CustomHeader from '@/components/Navigation/CustomHeader';
import Footer from '@/components/Navigation/Footer';

const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = (): void => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth">
      <CustomHeader isLanding={true} />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/TupForLanding.jpg"
            alt="TUP Campus"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#8b0000]/90" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">
            The Digital Archive of TUP Excellence
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-medium mb-12 tracking-wide max-w-2xl mx-auto">
            A centralized repository for future-ready engineers. Store, search, and verify your research with institutional precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleGetStarted}
              className="group bg-white text-[#8b0000] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-[#fecaca] transition-all flex items-center gap-4"
            >
              Start Your Journey <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-white/50 cursor-pointer" onClick={() => window.scrollTo(0, window.innerHeight)}>
          <FaChevronDown size={30} />
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <span className="text-[#8b0000] font-black uppercase tracking-[0.3em] text-xs">Innovation First</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-gray-900">
                WHY CHOOSE TUP THESIS ARCHIVE?
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed font-medium">
                We've built more than just a storage system. It's a high-performance environment designed to protect institutional knowledge while making it accessible for the next generation of researchers.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Institutional Trust', desc: 'Secure repository endorsed by TUP-Taguig leadership.', icon: FaShieldAlt },
                { title: 'Modern Tools', desc: 'Next-gen search and analysis interface.', icon: FaRocket },
                { title: 'Clean Design', desc: 'A minimalist, flawless student-focused experience.', icon: FaLightbulb },
                { title: 'Verified Quality', desc: 'AI-assisted verification for academic standards.', icon: FaCheckCircle },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:bg-[#8b0000] group transition-all duration-500">
                  <item.icon className="text-3xl text-[#8b0000] mb-6 group-hover:text-white transition-colors" />
                  <h3 className="text-xl font-black mb-3 text-gray-900 group-hover:text-white uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 group-hover:text-white/60 font-bold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What It Do Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-[#8b0000] to-[#500000] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <span className="text-[#fecaca] font-black uppercase tracking-[0.3em] text-xs mb-4 block text-center">Core Functions</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">WHAT DOES IT DO?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-6 group">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border-4 border-white/10 group-hover:bg-[#b91c1c] transition-all">
                <FaSearch className="text-4xl text-[#fecaca]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Rapid Search</h3>
              <p className="text-white/50 font-bold leading-relaxed">Search through thousands of institutional papers in milliseconds with our advanced indexing engine.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border-4 border-white/10 group-hover:bg-[#b91c1c] transition-all">
                <FaCheckCircle className="text-4xl text-[#fecaca]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">AI Validation</h3>
              <p className="text-white/50 font-bold leading-relaxed">Ensure your research title and abstract meet quality standards before official submission.</p>
            </div>
            <div className="space-y-6 group">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border-4 border-white/10 group-hover:bg-[#b91c1c] transition-all">
                <FaFileAlt className="text-4xl text-[#fecaca]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Full Archive</h3>
              <p className="text-white/50 font-bold leading-relaxed">Digitally store your approved thesis with metadata to inspire future Technologists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[#8b0000] font-black uppercase tracking-[0.3em] text-xs mb-4 block text-center">System Workflow</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase">HOW DOES IT WORK?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              { step: '01', title: 'Register', desc: 'Securely create your student account using your TUP ID.' },
              { step: '02', title: 'Explore', desc: 'Search previous research to find inspiration for your project.' },
              { step: '03', title: 'Analyze', desc: 'Upload your title and abstract for institutional verification.' },
              { step: '04', title: 'Archive', desc: 'Secure your legacy in the official TUP digital library.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 hover:translate-y-[-10px] transition-all duration-500 border border-gray-100 flex flex-col justify-between h-full">
                <div>
                  <span className="text-6xl font-black text-gray-100 mb-8 block leading-none">{item.step}</span>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <button
              onClick={handleGetStarted}
              className="bg-[#8b0000] text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl transform hover:scale-105"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
