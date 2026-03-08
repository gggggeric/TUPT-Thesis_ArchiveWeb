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
    FaChevronRight
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface UserData {
    name?: string;
    idNumber?: string;
    age?: number;
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
        { icon: FaFileAlt, label: 'My Documents', path: '/documents' },
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
            <div className="fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl z-[1000] flex flex-col animate-[slide-in-left_0.3s_ease] border-r border-gray-100">
                {/* Header Section with TUPT Theme Gradient */}
                <div className="bg-gradient-to-br from-[#8b0000] to-[#500000] pt-16 pb-8 px-6 relative overflow-hidden border-b-4 border-white/10">
                    {/* Background decoration */}
                    <div className="absolute top-[-30%] right-[-20%] w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl" />

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
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">Navigation</p>
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={index}
                                    className="w-full flex items-center justify-between py-4 px-4 rounded-2xl bg-transparent border-none cursor-pointer transition-all duration-300 hover:bg-gray-50 group"
                                    onClick={() => handleMenuItemPress(item.path)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:bg-[#8b0000] group-hover:shadow-lg">
                                            <IconComponent className="text-lg text-[#8b0000] transition-colors duration-300 group-hover:text-white" />
                                        </div>
                                        <span className="text-sm font-black text-gray-700 uppercase tracking-wider group-hover:text-[#8b0000] transition-colors duration-300">
                                            {item.label}
                                        </span>
                                    </div>
                                    <FaChevronRight className="text-xs text-gray-300 group-hover:text-[#8b0000] transition-all duration-300 group-hover:translate-x-1" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bg-gray-50 px-6 py-6 space-y-4">
                    {/* Logout Button */}
                    {user && (
                        <button
                            className="w-full py-4 px-4 rounded-2xl bg-[#8b0000]/5 text-[#8b0000] flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-[#8b0000] hover:text-white hover:shadow-xl group border border-[#8b0000]/10"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt className="text-base transition-transform group-hover:translate-x-[-2px]" />
                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                    )}

                    {/* Login Button */}
                    {!user && (
                        <button
                            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#8b0000] to-[#660000] border-none flex items-center justify-center gap-3 cursor-pointer text-white shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
                            onClick={() => { onClose(); router.push('/login'); }}
                        >
                            <FaSignInAlt className="text-base" />
                            <span className="text-xs font-black uppercase tracking-widest">Portal Login</span>
                        </button>
                    )}

                    {/* App Info Footer */}
                    <div className="text-center">
                        <div className="w-12 h-1 bg-gray-200 mx-auto rounded-full mb-4 opacity-50" />
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">
                            TUPT Thesis Archive
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HamburgerMenu;
