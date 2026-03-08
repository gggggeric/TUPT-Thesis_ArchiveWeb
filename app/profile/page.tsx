'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaUser,
    FaIdCard,
    FaCalendarAlt,
    FaClock,
    FaEdit,
    FaArrowLeft,
    FaGraduationCap
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';

interface UserData {
    _id: string;
    name: string;
    idNumber: string;
    birthdate: string;
    age: number;
    createdAt: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    if (!user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader onMenuPress={() => setMenuVisible(true)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/home')}
                    className="flex items-center gap-2 text-[#8b0000] font-black uppercase tracking-widest text-xs mb-8 hover:underline group transition-all"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-[#8b0000] to-[#500000] p-10 text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center shadow-2xl">
                                <FaUser className="text-5xl text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight mb-2">{user.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                        {user.idNumber}
                                    </span>
                                    <span className="bg-[#8b0000] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg">
                                        Active Student
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaIdCard className="text-[#8b0000] opacity-50" /> University ID
                                </p>
                                <p className="text-lg font-bold text-gray-900 group-hover:text-[#8b0000] transition-colors">{user.idNumber}</p>
                                <div className="w-8 h-0.5 bg-gray-100 mt-2 group-hover:w-full transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#8b0000] opacity-50" /> Birth Date
                                </p>
                                <p className="text-lg font-bold text-gray-900 group-hover:text-[#8b0000] transition-colors">{formatDate(user.birthdate)}</p>
                                <div className="w-8 h-0.5 bg-gray-100 mt-2 group-hover:w-full transition-all duration-500" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaClock className="text-[#8b0000] opacity-50" /> Current Age
                                </p>
                                <p className="text-lg font-bold text-gray-900 group-hover:text-[#8b0000] transition-colors">{user.age || 'N/A'} Years Old</p>
                                <div className="w-8 h-0.5 bg-gray-100 mt-2 group-hover:w-full transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaGraduationCap className="text-[#8b0000] opacity-50" /> Member Since
                                </p>
                                <p className="text-lg font-bold text-gray-900 group-hover:text-[#8b0000] transition-colors">
                                    {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                                </p>
                                <div className="w-8 h-0.5 bg-gray-100 mt-2 group-hover:w-full transition-all duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="bg-gradient-to-r from-[#8b0000] to-[#500000] text-white font-black uppercase tracking-[0.2em] text-xs px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-[#8b0000]/20 transition-all active:scale-95 flex items-center gap-3 border-none"
                        >
                            <FaEdit className="text-sm" /> Edit Profile Details
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                        Student Information System • TUPT Archive
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
