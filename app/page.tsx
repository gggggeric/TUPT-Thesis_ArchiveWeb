'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  FaRocket,
  FaRobot,
  FaFileUpload,
} from 'react-icons/fa';
import Link from 'next/link';

import CustomHeader from '@/components/Navigation/CustomHeader';
import Footer from '@/components/Navigation/Footer';

/* ───── Shared animation variants ───── */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

const smoothEase: any = [0.22, 1, 0.36, 1];

/* ───── Feature data for alternating sections ───── */
const features = [
  {
    number: '01',
    badge: 'Smart Search',
    title: 'Find Any Thesis in Seconds',
    desc: 'Our advanced semantic search engine indexes thousands of institutional papers. Search by title, abstract, author, or keywords — results are ranked by relevance in milliseconds.',
    icon: FaSearch,
    color: '#3B82F6',       // blue
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-100',
    textColor: 'text-blue-500',
  },
  {
    number: '02',
    badge: 'AI Assistance',
    title: 'Get AI-Powered Title Ideas',
    desc: 'Stuck on a thesis topic? Use our AI recommendation engine to generate title ideas, structural suggestions, and research directions — all tailored to your department and interests.',
    icon: FaRobot,
    color: '#8B5CF6',       // purple
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-100',
    textColor: 'text-purple-500',
  },
  {
    number: '03',
    badge: 'Advanced Filtering',
    title: 'Narrow Down with Precision',
    desc: 'Filter search results by department, publication year, author, or category. Combine multiple filters to pinpoint exactly the research you need from the entire archive.',
    icon: FaChartLine,
    color: '#F97316',       // orange
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-100',
    textColor: 'text-orange-500',
  },
  {
    number: '04',
    badge: 'Document Analysis',
    title: 'Upload & Extract Metadata Instantly',
    desc: 'Upload your thesis PDF and let our system automatically extract the title, authors, abstract, and key metadata. No manual entry needed — everything is processed in seconds.',
    icon: FaFileUpload,
    color: '#22C55E',       // green
    bgLight: 'bg-green-50',
    borderLight: 'border-green-100',
    textColor: 'text-green-500',
  },
];

const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = (): void => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-white scroll-smooth">
      <CustomHeader isLanding={true} />

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/TupForLanding.jpg"
            alt="TUP Campus"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#8b0000]/90" />
        </div>

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: smoothEase }}
        >
          <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">
            The Digital Archive of TUP Excellence
          </h1>
          <p className="text-lg md:text-2xl text-white/70 font-medium mb-12 tracking-wide max-w-2xl mx-auto">
            A centralized repository for future-ready engineers. Store, search, and verify your research with institutional precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleGetStarted}
              className="group bg-white text-[#8b0000] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-[#fecaca] transition-all flex items-center gap-4"
            >
              Start Your Journey
            </button>
          </div>
        </motion.div>

      </section>

      {/* ════════════════════════════════════════════
          FEATURE SECTIONS — alternating left/right
      ════════════════════════════════════════════ */}
      {features.map((feat, i) => {
        const isEven = i % 2 === 0; // even = title left, content right
        const Icon = feat.icon;

        return (
          <section key={feat.number} className="py-24 md:py-32 px-6 overflow-hidden border-b border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-24`}>

                {/* TITLE SIDE */}
                <motion.div
                  className="flex-1 space-y-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.4 }}
                  variants={isEven ? fadeLeft : fadeRight}
                  transition={{ duration: 0.8, ease: smoothEase }}
                >
                  <span className={`${feat.textColor} font-black uppercase tracking-[0.3em] text-xs`}>Feature {feat.number}</span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-white uppercase">
                    {feat.title}
                  </h2>
                  <div className="w-16 h-1 rounded-full" style={{ backgroundColor: feat.color }} />
                </motion.div>

                {/* CONTENT SIDE */}
                <motion.div
                  className="flex-1"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.4 }}
                  variants={isEven ? fadeRight : fadeLeft}
                  transition={{ duration: 0.8, ease: smoothEase, delay: 0.15 }}
                >
                  <div className={`${feat.bgLight} rounded-[2.5rem] p-6 sm:p-10 md:p-14 border ${feat.borderLight} relative overflow-hidden group`}>
                    <motion.div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border"
                      style={{ backgroundColor: `${feat.color}10`, borderColor: `${feat.color}20` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="text-3xl" style={{ color: feat.color }} />
                    </motion.div>
                    <span className={`inline-block ${feat.textColor} font-black uppercase tracking-widest text-[10px] mb-4 px-3 py-1 rounded-full border ${feat.borderLight}`}>
                      {feat.badge}
                    </span>
                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>
        );
      })}

      {/* ════════════════════════════════════════════
          WHY CHOOSE SECTION
      ════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <motion.div
              className="flex-1 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeLeft}
              transition={{ duration: 0.8, ease: smoothEase }}
            >
              <span className="text-red-700 font-black uppercase tracking-[0.3em] text-xs">Innovation First</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-gray-900">
                WHY CHOOSE TUP THESIS ARCHIVE?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed font-semibold transition-colors">
                We&apos;ve built more than just a storage system. It&apos;s a high-performance environment designed to protect institutional knowledge while making it accessible for the next generation of researchers.
              </p>
            </motion.div>
            <motion.div
              className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeRight}
              transition={{ duration: 0.8, ease: smoothEase, delay: 0.15 }}
            >
              {[
                { title: 'Institutional Trust', desc: 'Secure repository endorsed by TUP-Taguig leadership.', icon: FaShieldAlt },
                { title: 'Modern Tools', desc: 'Next-gen search and analysis interface.', icon: FaRocket },
                { title: 'Clean Design', desc: 'A minimalist, flawless student-focused experience.', icon: FaLightbulb },
                { title: 'Verified Quality', desc: 'AI-assisted verification for academic standards.', icon: FaCheckCircle },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-white shadow-xl p-6 md:p-10 rounded-[2.5rem] border border-gray-100 hover:bg-[#8b0000] group transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: smoothEase }}
                >
                  <item.icon className="text-3xl text-red-500 mb-6 group-hover:text-white transition-colors" />
                  <h3 className="text-xl font-black mb-3 text-gray-900 group-hover:text-white uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 font-bold leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHAT IT DOES SECTION
      ════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-gradient-to-br from-[#8b0000] to-[#500000] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={fadeUp}
            transition={{ duration: 0.8, ease: smoothEase }}
          >
            <span className="text-[#fecaca] font-black uppercase tracking-[0.3em] text-xs mb-4 block text-center">Core Functions</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">WHAT DOES IT DO?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: FaSearch, title: 'Rapid Search', desc: 'Search through thousands of institutional papers in milliseconds with our advanced indexing engine.' },
              { icon: FaCheckCircle, title: 'AI Validation', desc: 'Ensure your research title and abstract meet quality standards before official submission.' },
              { icon: FaFileAlt, title: 'Full Archive', desc: 'Digitally store your approved thesis with metadata to inspire future Technologists.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="space-y-6 group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: smoothEase }}
              >
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto border-4 border-white/10 group-hover:bg-white transition-all shadow-xl">
                  <item.icon className="text-4xl text-[#fecaca] group-hover:text-[#8b0000]" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{item.title}</h3>
                <p className="text-white/80 font-bold leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS SECTION
      ════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={fadeUp}
            transition={{ duration: 0.8, ease: smoothEase }}
          >
            <span className="text-[#8b0000] font-black uppercase tracking-[0.3em] text-xs mb-4 block text-center">System Workflow</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase">HOW DOES IT WORK?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              { step: '01', title: 'Register', desc: 'Securely create your student account using your TUP ID.' },
              { step: '02', title: 'Explore', desc: 'Search previous research to find inspiration for your project.' },
              { step: '03', title: 'Analyze', desc: 'Upload your title and abstract for institutional verification.' },
              { step: '04', title: 'Archive', desc: 'Secure your legacy in the official TUP digital library.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:translate-y-[-10px] transition-all duration-500 border border-gray-100 flex flex-col justify-between h-full"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: smoothEase }}
              >
                <div>
                  <span className="text-6xl font-black text-gray-100 mb-8 block leading-none">{item.step}</span>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, ease: smoothEase }}
          >
            <button
              onClick={handleGetStarted}
              className="bg-[#8b0000] text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl transform hover:scale-105"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
