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
import API_BASE_URL from '@/lib/api';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    idNumber: string;
    birthdate: string;
    age: number;
    avatar?: string;
    profilePhoto?: string;
    department?: string;
    student_id?: string;
    createdAt: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const rawUserData = localStorage.getItem('userData');
            const token = localStorage.getItem('token');

            if (!rawUserData || !token) {
                router.push('/login');
                return;
            }

            const storedUser = JSON.parse(rawUserData);
            setUser(storedUser);

            try {
                const response = await fetch(`${API_BASE_URL}/user/profile?userId=${storedUser._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data.user);
                    localStorage.setItem('userData', JSON.stringify(data.data.user));
                }
            } catch (error) {
                console.error('Error fetching latest profile:', error);
            }
        };

        fetchUserProfile();
    }, [router]);

    if (!user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-foreground selection:bg-[#2DD4BF] selection:text-white overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DD4BF]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#2DD4BF]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader onMenuPress={() => setMenuVisible(true)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <div className="flex-1 relative z-10 py-32 px-6">
                <main className="max-w-4xl mx-auto space-y-12">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-2 text-primary/80 font-black uppercase tracking-widest text-xs mb-8 hover:text-primary group transition-all"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
                    </button>

                    {/* Hero Profile Section */}
                    <div className="bg-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border border-border-custom shadow-xl overflow-hidden relative group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-border-custom shadow-xl group-hover:scale-105 transition-transform duration-700">
                                    <img
                                        src={user?.profilePhoto ? (user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`) : (user?.avatar || "/default-avatar.png")}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-card rounded-2xl flex items-center justify-center shadow-xl border border-border-custom text-primary">
                                    <FaCamera className="text-base md:text-lg" />
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">{user.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border-custom text-text-dim">
                                        {user.idNumber}
                                    </span>
                                    <span className="bg-primary/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30 shadow-sm text-primary">
                                        Active Student
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="bg-card rounded-[2.5rem] p-10 border border-border-custom shadow-xl">
                        <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                            <span className="w-2 h-2 bg-teal-400 rounded-full" />
                            Personal Information
                            <span className="h-px flex-1 bg-gray-100" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaIdCard className="text-[#2DD4BF] opacity-80" /> University ID
                                </p>
                                <p className="text-lg font-bold text-foreground group-hover:text-[#2DD4BF] transition-colors">{user.idNumber}</p>
                                <div className="w-8 h-0.5 bg-border-custom mt-2 group-hover:w-full group-hover:bg-teal-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#2DD4BF] opacity-80" /> Birth Date
                                </p>
                                <p className="text-lg font-bold text-foreground group-hover:text-[#2DD4BF] transition-colors">{formatDate(user.birthdate)}</p>
                                <div className="w-8 h-0.5 bg-border-custom mt-2 group-hover:w-full group-hover:bg-teal-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaClock className="text-[#2DD4BF] opacity-80" /> Current Age
                                </p>
                                <p className="text-lg font-bold text-foreground group-hover:text-[#2DD4BF] transition-colors">{calculateAge(user.birthdate)} Years Old</p>
                                <div className="w-8 h-0.5 bg-border-custom mt-2 group-hover:w-full group-hover:bg-teal-200 transition-all duration-500" />
                            </div>

                            <div className="group">
                                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <FaGraduationCap className="text-[#2DD4BF] opacity-80" /> Member Since
                                </p>
                                <p className="text-lg font-bold text-foreground group-hover:text-[#2DD4BF] transition-colors">
                                    {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                                </p>
                                <div className="w-8 h-0.5 bg-border-custom mt-2 group-hover:w-full group-hover:bg-teal-200 transition-all duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-surface p-8 border border-border-custom flex justify-center rounded-[2.5rem] shadow-sm">
                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="bg-primary/5 border border-primary/30 text-primary font-black uppercase tracking-[0.2em] text-[11px] px-10 py-4 rounded-2xl shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 active:scale-95 active:bg-primary/30 flex items-center gap-3"
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
