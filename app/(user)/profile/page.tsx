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
import API_BASE_URL from '@/app/lib/api';
import ProfileSkeleton from '@/app/components/UI/skeleton_loaders/users/ProfileSkeleton';

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
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => setShowSkeleton(true), 500);
        } else {
            setShowSkeleton(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            const rawUserData = localStorage.getItem('userData');
            const token = localStorage.getItem('token');

            if (!rawUserData || !token) {
                router.push('/auth/login');
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
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    if (loading && !user) {
        if (showSkeleton) return <ProfileSkeleton />;
        return <div className="flex-1 min-h-screen" />; // Placeholder for first 500ms
    }
    
    // Narrow type for TypeScript
    const currentUser = user;
    if (!currentUser) return null;

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
        <div className="flex-1 relative z-10 py-32 px-6">
                    {/* Background Glows */}
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DD4BF]/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#2DD4BF]/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                        {/* Back Button */}
                        <button
                            onClick={() => router.push('/home')}
                            className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-widest text-xs mb-8 hover:text-primary group transition-all"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
                        </button>

                        {/* Hero Profile Section */}
                        <div className="bg-[#1E1E2E]/60 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border border-white/5 shadow-xl overflow-hidden relative group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-700 bg-white/5">
                                        <img
                                            src={currentUser?.profilePhoto ? (currentUser.profilePhoto.startsWith('http') ? currentUser.profilePhoto : `${API_BASE_URL}${currentUser.profilePhoto}`) : (currentUser?.avatar || "/default-avatar.png")}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-[#1E1E2E] rounded-2xl flex items-center justify-center shadow-xl border border-white/10 text-primary">
                                        <FaCamera className="text-base md:text-lg" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">{currentUser.name}</h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5 text-white/50">
                                            {currentUser.idNumber}
                                        </span>
                                        <span className="bg-primary/5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 shadow-sm text-primary">
                                            Student Access
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="bg-[#1E1E2E]/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-xl">
                            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                                <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#2DD4BF]" />
                                Personal Information
                                <span className="h-px flex-1 bg-white/5" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="group">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <FaIdCard className="text-primary opacity-80" /> University ID
                                    </p>
                                    <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{currentUser.idNumber}</p>
                                    <div className="w-8 h-0.5 bg-white/5 mt-2 group-hover:w-full group-hover:bg-primary transition-all duration-500" />
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <FaCalendarAlt className="text-primary opacity-80" /> Birth Date
                                    </p>
                                    <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{formatDate(currentUser.birthdate)}</p>
                                    <div className="w-8 h-0.5 bg-white/5 mt-2 group-hover:w-full group-hover:bg-primary transition-all duration-500" />
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <FaClock className="text-primary opacity-80" /> Current Age
                                    </p>
                                    <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{calculateAge(currentUser.birthdate)} Years Old</p>
                                    <div className="w-8 h-0.5 bg-white/5 mt-2 group-hover:w-full group-hover:bg-primary transition-all duration-500" />
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <FaGraduationCap className="text-primary opacity-80" /> Member Since
                                    </p>
                                    <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                        {currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear() : new Date().getFullYear()}
                                    </p>
                                    <div className="w-8 h-0.5 bg-white/5 mt-2 group-hover:w-full group-hover:bg-primary transition-all duration-500" />
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="bg-white/5 p-8 border border-white/5 flex justify-center rounded-[2.5rem] shadow-sm">
                            <button
                                onClick={() => router.push('/profile/edit')}
                                className="bg-primary/5 border border-primary/30 text-primary font-bold uppercase tracking-[0.2em] text-[11px] px-10 py-4 rounded-2xl shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 active:scale-95 flex items-center gap-3"
                            >
                                <FaEdit className="text-sm" /> Edit Profile Details
                            </button>
                        </div>
                    </div>

        </div>
    );
};

export default ProfilePage;
