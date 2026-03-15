'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    FaHome,
    FaFileAlt,
    FaUser,
    FaEdit,
    FaInfoCircle,
    FaSignOutAlt,
    FaSignInAlt,
    FaChevronRight,
    FaUserShield,
    FaFolderOpen,
    FaUpload
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface UserData {
    name?: string;
    idNumber?: string;
    age?: number;
    isAdmin?: boolean;
    [key: string]: unknown;
}

interface MenuItem {
    icon: IconType;
    label: string;
    path: string;
}

interface HamburgerMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

const HamburgerMenu = ({ isVisible, onClose }: HamburgerMenuProps) => {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        if (isVisible) loadUserData();
    }, [isVisible]);

    const loadUserData = async () => {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) setUser(JSON.parse(userData));
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const menuItems: MenuItem[] = [
        { icon: FaHome, label: 'Home', path: '/home' },
        ...(user?.isAdmin ? [{ icon: FaUserShield, label: 'Admin Panel', path: '/admin' }] : []),
        { icon: FaFileAlt, label: 'Analysis Workspace', path: '/documents' },
        { icon: FaUpload, label: 'Submit Thesis', path: '/documents/create' },
        { icon: FaFolderOpen, label: 'My Submissions', path: '/documents/submissions' },
    ];

    const handleMenuItemPress = (path: string) => {
        onClose();
        router.push(path);
    };

    const handleLogout = async () => {
        try {
            const userName = user?.name || 'User';
            localStorage.removeItem('userData');
            setUser(null);
            onClose();
            toast.success(`Goodbye, ${userName}! You have been logged out successfully.`);
            setTimeout(() => { router.push('/login'); }, 1500);
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error('There was an error logging out. Please try again.');
        }
    };

    const handleProfileClick = () => {
        onClose();
        router.push('/profile');
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-[#3f2b2b]/60 backdrop-blur-md z-[999] animate-[fade-in-overlay_0.3s_ease]"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="fixed top-0 left-0 h-full w-[340px] max-w-[85vw] bg-gradient-to-b from-[#8b0000] to-[#3f1010] shadow-2xl z-[1000] flex flex-col animate-[slide-in-left_0.3s_ease] border-r border-[#8b0000]/30 text-white">
                {/* Header Section with TUPT Theme Gradient */}
                <div className="bg-transparent pt-16 pb-8 px-6 relative overflow-hidden border-b border-white/10">
                    {/* Background decoration */}
                    <div className="absolute top-[-30%] right-[-20%] w-[200px] h-[200px] bg-black/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-black/10 rounded-full blur-2xl" />

                    {/* User Profile Section */}
                    <div
                        className="relative z-10 flex flex-col items-center cursor-pointer"
                        onClick={handleProfileClick}
                    >
                        <div className="relative mb-4">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-xl">
                                <FaUser className="text-3xl text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#8b0000] flex items-center justify-center shadow-lg border-2 border-[#3f2b2b]">
                                <FaEdit className="text-[10px] text-white" />
                            </div>
                        </div>
                        <div className="text-xl font-black text-white mb-1 text-center truncate w-full">
                            {user?.name || 'Guest User'}
                        </div>
                        <div className="bg-white/10 rounded-lg px-3 py-1 mb-1">
                            <span className="text-xs font-black text-[#fecaca] uppercase tracking-widest">
                                {user?.idNumber || 'TUPT-00-0000'}
                            </span>
                        </div>
                        <div className="text-[10px] text-white/60 mt-2 font-black tracking-[0.2em] uppercase">
                            University Archive Portal
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 py-6 px-4 overflow-y-auto">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 px-4">Navigation</p>
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={index}
                                    className="w-full flex items-center justify-between py-4 px-4 rounded-2xl bg-transparent border-none cursor-pointer transition-all duration-300 hover:bg-white/10 group"
                                    onClick={() => handleMenuItemPress(item.path)}
                                >
                                    <div className="flex items-center gap-4 flex-1 pr-4">
                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-lg">
                                            <IconComponent className="text-lg text-white/70 transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                        <span className="text-sm font-black text-left leading-tight text-white/80 uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                                            {item.label}
                                        </span>
                                    </div>
                                    <FaChevronRight className="text-xs shrink-0 text-white/20 group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-1" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bg-black/20 px-6 py-6 space-y-4 border-t border-white/10">
                    {/* Logout Button */}
                    {user && (
                        <button
                            className="w-full py-4 px-4 rounded-2xl bg-white/5 text-white/80 flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-xl group border border-white/10"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt className="text-base transition-transform group-hover:translate-x-[-2px]" />
                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                    )}

                    {/* Login Button */}
                    {!user && (
                        <button
                            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 border-none flex items-center justify-center gap-3 cursor-pointer text-white shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:from-red-500 hover:to-red-700"
                            onClick={() => { onClose(); router.push('/login'); }}
                        >
                            <FaSignInAlt className="text-base" />
                            <span className="text-xs font-black uppercase tracking-widest">Portal Login</span>
                        </button>
                    )}

                    {/* App Info Footer */}
                    <div className="text-center">
                        <div className="w-12 h-1 bg-white/20 mx-auto rounded-full mb-4 opacity-50" />
                        <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">
                            TUPT Thesis Archive
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HamburgerMenu;
