'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    FaHome,
    FaFileAlt,
    FaUser,
    FaUsers,
    FaEdit,
    FaSignOutAlt,
    FaChevronRight,
    FaUserShield,
    FaFolderOpen,
    FaUpload,
    FaChevronLeft,
    FaHandshake,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import API_BASE_URL from '@/app/lib/api';
import { useSidebar } from '@/app/context/SidebarContext';

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

const sidebarVariants: Variants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
};

const labelVariants: Variants = {
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    hidden: { opacity: 0, x: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

const sectionVariants: Variants = {
    visible: { opacity: 1, transition: { duration: 0.2 } },
    hidden: { opacity: 0, transition: { duration: 0.1 } },
};

export default function Sidebar() {
    const { isExpanded, isReady, toggleSidebar: onToggle } = useSidebar();
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

    const menuItems: MenuItem[] = user?.isAdmin 
        ? [
            { icon: FaUserShield, label: 'Admin Dashboard', path: '/admin' },
            { icon: FaHandshake, label: 'Collaboration', path: '/admin/collaboration' },
            { icon: FaFileAlt, label: 'Thesis Management', path: '/admin/theses' },
            { icon: FaUsers, label: 'User Management', path: '/admin/users' },
        ]
        : [
            { icon: FaHome, label: 'Home', path: '/home' },
            { icon: FaFileAlt, label: 'Analysis Workspace', path: '/documents', section: 'TOOLS' },
            { icon: FaUpload, label: 'Submit Thesis', path: '/documents/create' },
            { icon: FaFolderOpen, label: 'My Submissions', path: '/documents/submissions' },
            { icon: FaHandshake, label: 'Collaboration', path: '/collaboration', section: 'SOCIAL' },
        ];

    const handleLogout = async () => {
        try {
            const userName = user?.name || 'User';
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            toast.success(`Goodbye, ${userName}! You have been logged out.`);
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            router.push('/auth/login');
        }
    };

    if (!mounted || !isReady) return null;

    return (
        <motion.div
            initial={isExpanded ? 'expanded' : 'collapsed'}
            variants={sidebarVariants}
            animate={isExpanded ? 'expanded' : 'collapsed'}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ width: isExpanded ? 280 : 80 }}
            className="fixed left-0 top-0 bottom-0 z-[60] bg-black/20 backdrop-blur-xl border-r border-white/5 shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Header / Brand / Toggle */}
            <motion.div 
                className={`flex items-center transition-all duration-300 min-h-[88px] ${isExpanded ? 'p-5 justify-between' : 'p-2 justify-center'}`}
            >
                <motion.div className="flex items-center gap-3">
                    <motion.div
                        className={`flex-shrink-0 flex items-center justify-center cursor-pointer group overflow-hidden ${isExpanded ? 'w-12 h-12' : 'w-10 h-10'}`}
                        initial={false}
                        animate={{ width: isExpanded ? 48 : 40, height: isExpanded ? 48 : 40 }}
                        onClick={() => !isExpanded && onToggle()}
                    >
                        <img
                            src="/assets/tup-logo.png"
                            alt="TUP Logo"
                            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                    </motion.div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                key="brand-text"
                                initial={false}
                                animate="visible"
                                exit="hidden"
                                variants={labelVariants}
                                className="flex flex-col min-w-0"
                            >
                                <span className="text-white font-extrabold uppercase tracking-tight text-base leading-none truncate whitespace-nowrap">TUPT Archive</span>
                                <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mt-1 opacity-80 whitespace-nowrap">Active Portal</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.button
                            key="collapse-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={onToggle}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-colors border border-white/5 active:scale-90"
                        >
                            <FaChevronLeft className="text-xs" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Profile Section */}
            <motion.div
                className={`mb-8 flex flex-col transition-all duration-300 ${isExpanded ? 'px-4 items-start' : 'px-0 items-center'}`}
            >
                <motion.div
                onClick={() => router.push('/profile')}
                    className={`relative cursor-pointer group flex items-center gap-4 p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'w-full hover:bg-white/5' : ''}`}
                >
                    <div className="relative flex-shrink-0">
                        <motion.div
                            className={`rounded-xl bg-card/20 flex items-center justify-center border-2 border-white/10 shadow-xl overflow-hidden ${isExpanded ? 'w-14 h-14' : 'w-12 h-12'}`}
                            initial={false}
                            animate={{ width: isExpanded ? 56 : 48, height: isExpanded ? 56 : 48 }}
                            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {user?.profilePhoto ? (
                                <img
                                    src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-xl text-white/50" />
                            )}
                        </motion.div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    key="edit-badge"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-primary flex items-center justify-center shadow-lg border-2 border-[#1E293B]"
                                >
                                    <FaEdit className="text-[8px] text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                key="profile-text"
                                initial={false}
                                animate="visible"
                                exit="hidden"
                                variants={labelVariants}
                                className="flex flex-col truncate overflow-hidden"
                            >
                                <span className="text-white font-bold text-sm truncate whitespace-nowrap">{user?.name || 'Guest User'}</span>
                                <span className="text-secondary text-[10px] font-bold tracking-widest uppercase truncate whitespace-nowrap">{user?.idNumber || 'LOGIN TO PORTAL'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* Navigation Section */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${isExpanded ? 'px-4 space-y-2' : 'px-0 space-y-1 mt-[-10px]'}`}>
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <div key={index}>
                            {/* Section label */}
                             {item.section && (
                                <AnimatePresence>
                                    {isExpanded ? (
                                        <motion.p
                                            key="section-label"
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={sectionVariants}
                                            className="font-bold text-white/20 uppercase tracking-[0.3em] px-4 text-[10px] mt-6 mb-3 whitespace-nowrap"
                                        >
                                            {item.section}
                                        </motion.p>
                                    ) : (
                                        <motion.div
                                            key="section-divider"
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={sectionVariants}
                                            className="mx-2 my-3 h-px bg-white/[0.06]"
                                        />
                                    )}
                                </AnimatePresence>
                            )}

                            <div
                                className="relative"
                            >
                                 <button
                                    onClick={() => router.push(item.path)}
                                    className={`w-full group relative flex items-center transition-all duration-300 rounded-lg ${isExpanded ? 'p-3 justify-start gap-4' : 'p-0 justify-center h-12'} ${isActive ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {/* Active indicator */}
                                     <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, scaleY: 0.5, x: -4 }}
                                                animate={{ opacity: 1, scaleY: 1, x: 0 }}
                                                exit={{ opacity: 0, scaleY: 0.5, x: -4 }}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_12px_rgba(45,212,191,0.4)] z-10"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </AnimatePresence>

                                     <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isActive ? '' : 'group-hover:scale-105'}`}>
                                        <Icon className={`text-lg transition-all duration-300 ${isActive ? 'scale-105 text-primary' : 'group-hover:scale-105'}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                key={`label-${item.label}`}
                                                initial={false}
                                                animate="visible"
                                                exit="hidden"
                                                variants={labelVariants}
                                                className="text-[13px] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {isExpanded && isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="ml-auto"
                                        >
                                            <FaChevronRight className="text-[10px] text-primary/50" />
                                        </motion.div>
                                    )}
                                </button>

                            </div>
                        </div>
                    );
                })}
            </div>

             {/* Bottom Sign-out Section */}
            <motion.div layout className={`mt-auto border-t border-white/5 bg-black/10 p-3`}>
                <div className="relative">
                    <motion.button
                        layout
                        onClick={handleLogout}
                        className={`w-full flex items-center transition-all duration-300 group gap-4 rounded-xl hover:bg-red-500/10 text-white/50 hover:text-red-400 ${isExpanded ? 'p-3 justify-start' : 'p-0 justify-center h-12'}`}
                    >
                        <motion.div layout className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/[0.03] flex items-center justify-center transition-all duration-300 border border-white/[0.03] group-hover:border-red-500/20 group-hover:bg-red-500/10">
                            <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
                        </motion.div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    key="signout-label"
                                    initial={false}
                                    animate="visible"
                                    exit="hidden"
                                    variants={labelVariants}
                                    layout
                                    className="text-xs font-bold uppercase tracking-widest text-inherit transition-colors whitespace-nowrap"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>

                </div>
            </motion.div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 0px; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.div>
    );
};


