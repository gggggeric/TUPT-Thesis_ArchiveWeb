'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    FaUser,
    FaCalendarAlt,
    FaLock,
    FaSave,
    FaTimes,
    FaArrowLeft,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import API_BASE_URL from '@/lib/api';

interface UserData {
    _id: string;
    name: string;
    idNumber: string;
    birthdate: string;
    age: number;
    createdAt: string;
}

const EditProfilePage = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const user: UserData = JSON.parse(userData);
        setFormData(prev => ({
            ...prev,
            name: user.name,
            birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : ''
        }));
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword && !formData.currentPassword) {
            toast.error('Current password is required to set a new password');
            return;
        }

        setIsLoading(true);

        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userData._id,
                    name: formData.name,
                    birthdate: formData.birthdate,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage with the latest user data from the server
                // This ensures createdAt and other system fields remain accurate
                localStorage.setItem('userData', JSON.stringify(data.data.user));

                toast.success('Profile updated successfully!');
                router.push('/profile');
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Cannot connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader onMenuPress={() => setMenuVisible(true)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full relative z-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-2 text-[#8b0000] font-black uppercase tracking-widest text-xs hover:underline group transition-all"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Cancel Edit
                    </button>
                    <h2 className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase flex items-center gap-4">
                        <span className="w-2 h-7 bg-[#8b0000] rounded-full" />
                        Edit Profile Details
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden text-gray-900">
                    <div className="p-10 space-y-10">
                        {/* Section: Basic Information */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-[#8b0000] uppercase tracking-[0.2em] border-b border-[#8b0000]/10 pb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FaUser className="text-[#8b0000]" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:bg-white transition-all text-gray-900"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FaCalendarAlt className="text-[#8b0000]" /> Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:bg-white transition-all text-gray-900"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Security */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-[#8b0000]/10 pb-4 text-gray-900">
                                <h3 className="text-[11px] font-black text-[#8b0000] uppercase tracking-[0.2em]">Security & Password</h3>
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Leave blank to keep current password</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <FaLock className="text-[#8b0000]" /> Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:bg-white transition-all text-gray-900"
                                            placeholder="Required only for password change"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8b0000] transition-colors p-2"
                                        >
                                            {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:bg-white transition-all text-gray-900"
                                                placeholder="New password"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8b0000] transition-colors p-2"
                                            >
                                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                name="confirmNewPassword"
                                                value={formData.confirmNewPassword}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:bg-white transition-all text-gray-900"
                                                placeholder="Confirm new password"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8b0000] transition-colors p-2"
                                            >
                                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-gray-50 p-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/profile')}
                            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-white text-gray-400 font-black uppercase tracking-[0.2em] text-xs border border-gray-100 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-3"
                        >
                            <FaTimes /> Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#8b0000] to-[#500000] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:shadow-2xl hover:shadow-[#8b0000]/20 transition-all active:scale-95 flex items-center justify-center gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-sm" /> Save Profile Details
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                        Student Identity Management • Institutional Security
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EditProfilePage;
