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
    FaGraduationCap,
    FaCamera,
    FaEnvelope
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    idNumber: string;
    birthdate: string;
    age: number;
    avatar?: string;
    department?: string;
    student_id?: string;
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
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900 selection:bg-[#8b0000] selection:text-white">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader onMenuPress={() => setMenuVisible(true)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <div className="flex-1 relative z-10 py-32 px-6">
                <main className="max-w-4xl mx-auto space-y-12">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-2 text-[#8b0000] font-black uppercase tracking-widest text-xs mb-8 hover:underline group transition-all"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
                    </button>

                    {/* Hero Profile Section */}
                    <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-xl group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute inset-0 bg-gray-50/10 backdrop-blur-sm" />
                                <img
                                    src={user?.avatar || "/default-avatar.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 text-[#8b0000]">
                                <FaCamera className="text-lg" />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">{user.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 text-gray-700">
                                        {user.idNumber}
                                    </span>
                                    <span className="bg-[#8b0000] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-900/10 shadow text-white">
                                        Active Student
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                            <span className="w-2 h-2 bg-red-400 rounded-full" />
                            Personal Information
                            <span className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaIdCard className="text-[#8b0000] opacity-80" /> University ID
                                </p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#8b0000] transition-colors">{user.idNumber}</p>
                                <div className="w-8 h-0.5 bg-gray-200 mt-2 group-hover:w-full group-hover:bg-red-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#8b0000] opacity-80" /> Birth Date
                                </p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#8b0000] transition-colors">{formatDate(user.birthdate)}</p>
                                <div className="w-8 h-0.5 bg-gray-200 mt-2 group-hover:w-full group-hover:bg-red-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaClock className="text-[#8b0000] opacity-80" /> Current Age
                                </p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#8b0000] transition-colors">{user.age || 'N/A'} Years Old</p>
                                <div className="w-8 h-0.5 bg-gray-200 mt-2 group-hover:w-full group-hover:bg-red-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaGraduationCap className="text-[#8b0000] opacity-80" /> Member Since
                                </p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#8b0000] transition-colors">
                                    {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                                </p>
                                <div className="w-8 h-0.5 bg-gray-200 mt-2 group-hover:w-full group-hover:bg-red-200 transition-all duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                            <span className="w-2 h-2 bg-red-400 rounded-full" />
                            Account Details
                            <span className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Department</p>
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{user?.department || 'Not Assigned'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Student ID</p>
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{user?.student_id || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Since</p>
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 p-8 border border-gray-100 flex justify-center rounded-[2.5rem] shadow-sm">
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="bg-[#8b0000] text-white font-black uppercase tracking-[0.2em] text-xs px-10 py-5 rounded-2xl shadow-xl hover:bg-red-800 transition-all active:scale-95 flex items-center gap-3 border-none"
                        >
                            <FaEdit className="text-sm" /> Edit Profile Details
                        </button>
                    </div>
                </main>

                <div className="mt-8 text-center pb-20">
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em]">
                        Student Information System • TUPT Archive
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage;
