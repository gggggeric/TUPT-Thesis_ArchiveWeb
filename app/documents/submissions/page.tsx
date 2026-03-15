'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import MySubmissions from '../components/MySubmissions';

const SubmissionsPage: React.FC = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [myTheses, setMyTheses] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        fetchUserTheses();
    }, []);

    const fetchUserTheses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMyTheses(data.data);
            }
        } catch (err) {
            console.error('Error fetching theses:', err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-white selection:bg-[#8b0000] selection:text-white">
            <CustomHeader onMenuPress={() => setMenuVisible(!menuVisible)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#8b0000]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 w-full pt-32 px-6 max-w-6xl mx-auto pb-16">
                <button
                    onClick={() => router.push('/documents')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-[-40px] ml-6 relative z-20"
                >
                    <FaArrowLeft /> Back to Workspace
                </button>

                {mounted && (
                    <MySubmissions
                        myTheses={myTheses}
                        onViewThesis={(id) => router.push(`/search_result?id=${id}`)}
                        hasAnalysisOrFile={false}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SubmissionsPage;
