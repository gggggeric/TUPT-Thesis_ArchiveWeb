'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    FaHome,
    FaFileAlt,
    FaUser,
    FaEdit,
    FaSignOutAlt,
    FaChevronRight,
    FaUserShield,
    FaFolderOpen,
    FaUpload,
    FaChevronLeft,
    FaBars
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import API_BASE_URL from '@/lib/api';

interface UserData {
    name?: string;
    idNumber?: string;
    isAdmin?: boolean;
    profilePhoto?: string;
}

interface MenuItem {
    icon: IconType;
    label: string;
    path: string;
    section?: string;
}

interface SidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
}

const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadUserData();
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'userData') loadUserData();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loadUserData = () => {
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
        { icon: FaFileAlt, label: 'Analysis workspace', path: '/documents', section: 'TOOLS' },
        { icon: FaUpload, label: 'Submit Thesis', path: '/documents/create' },
        { icon: FaFolderOpen, label: 'My Submissions', path: '/documents/submissions' },
    ];

    const handleLogout = () => {
        const userName = user?.name || 'User';
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        toast.success(`Goodbye, ${userName}! You have been logged out.`);
        router.push('/login');
    };

    if (!mounted) return null;

    return (
        <motion.div
            initial={false}
            animate={{ width: isExpanded ? 280 : 80 }}
            className="fixed left-0 top-0 bottom-0 z-[60] bg-[#1E293B] border-r border-white/5 shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
        >
            {/* Header / Brand / Toggle */}
            <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'p-5 justify-between' : 'p-3 pt-6 pb-0 justify-center flex-col gap-2'}`}>
                <div className={`flex items-center gap-3 ${isExpanded ? '' : 'flex-col'}`}>
                    
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group cursor-pointer" onClick={() => !isExpanded && onToggle()}>
                        <img
                            src="/assets/tup-logo.png"
                            alt="TUP Logo"
                            className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                        />
                    </div>
                    
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col min-w-0"
                        >
                            <span className="text-white font-black uppercase tracking-tighter text-base leading-none truncate">TUPT Archive</span>
                            <span className="text-primary font-bold uppercase tracking-[0.2em] text-[8px] mt-0.5">Active Portal</span>
                        </motion.div>
                    )}
                </div>
                
                {isExpanded && (
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-all border border-white/5 active:scale-90"
                    >
                        <FaChevronLeft className="text-xs" />
                    </button>
                )}
                
                {!isExpanded && null}
            </div>

            {/* Profile Section */}
            <div className={`${isExpanded ? 'px-4 mb-8 items-start' : 'px-2 mb-1 items-center'} flex flex-col transition-all duration-300`}>
                <div 
                    onClick={() => router.push('/profile')}
                    className={`relative cursor-pointer group flex items-center gap-4 p-2 rounded-2xl transition-all duration-300 ${isExpanded ? 'w-full hover:bg-white/5' : ''}`}
                >
                    <div className="relative flex-shrink-0">
                        <div className={`rounded-2xl bg-card/20 flex items-center justify-center border-2 border-white/10 shadow-xl overflow-hidden transition-all duration-500 ${isExpanded ? 'w-14 h-14' : 'w-12 h-12'}`}>
                            {user?.profilePhoto ? (
                                <img 
                                    src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-xl text-white/50" />
                            )}
                        </div>
                        {isExpanded && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-primary flex items-center justify-center shadow-lg border-2 border-[#1E293B]">
                                <FaEdit className="text-[8px] text-white" />
                            </div>
                        )}
                    </div>
                    
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col truncate overflow-hidden"
                        >
                            <span className="text-white font-bold text-sm truncate">{user?.name || 'Guest User'}</span>
                            <span className="text-secondary text-[10px] font-bold tracking-widest uppercase truncate">{user?.idNumber || 'LOGIN TO PORTAL'}</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation Section */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isExpanded ? 'px-4 space-y-2' : 'px-2 space-y-1 mt-[-10px]'}`}>
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <div key={index}>
                            {item.section && (
                                <p className={`font-bold text-white/20 uppercase tracking-[0.3em] px-4 transition-all duration-300 ${isExpanded ? 'text-[10px] mt-6 mb-3' : 'text-[8px] mt-4 mb-2'}`}>
                                    {item.section}
                                </p>
                            )}
                            <button
                                onClick={() => router.push(item.path)}
                                className={`w-full group relative flex items-center transition-all duration-300 ${isExpanded ? 'p-3 gap-4' : 'p-2 justify-center'} ${isActive ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
                                    <Icon className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
                                </div>
                                
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-[13px] font-bold uppercase tracking-wider"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className={`mt-auto border-t border-white/5 bg-black/10 transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center transition-all duration-300 group ${isExpanded ? 'gap-4 p-3 rounded-2xl hover:bg-red-500/10 text-white/50 hover:text-red-400' : 'justify-center p-2 text-white/30 hover:text-white'}`}
                >
                    <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/[0.03] flex items-center justify-center transition-all duration-300 border border-white/[0.03] group-hover:border-red-500/20 group-hover:bg-red-500/20">
                        <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
                    </div>
                    {isExpanded && (
                        <span className="text-xs font-bold uppercase tracking-widest text-inherit transition-colors">Sign Out</span>
                    )}
                </button>
                
                {isExpanded && null}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 0px;
                }
                .custom-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </motion.div>
    );
};

export default Sidebar;
