'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaArrowLeft, FaUserShield, FaUser, FaTrash, FaCheckCircle, FaExclamationCircle, FaPlus, FaChevronLeft, FaChevronRight, FaTimes, FaSearch, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminTableSkeleton from '@/app/components/UI/skeleton_loaders/admin/AdminTableSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

/* ───── Shared animation variants ───── */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const fadeUpTransition = {
    duration: 0.6,
    ease: "easeOut" as any,
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        idNumber: '',
        birthdate: '',
        password: '',
        isAdmin: false
    });

    const handleIDNumberChange = (value: string) => {
        const val = value.toUpperCase();
        if (val.length < formData.idNumber.length) {
            setFormData(prev => ({ ...prev, idNumber: val }));
            return;
        }

        let clean = val.replace(/[^A-Z0-9]/g, '');
        if (clean.length > 0 && !clean.startsWith('TUPT')) {
            if (!'TUPT'.startsWith(clean)) {
                clean = 'TUPT' + clean;
            }
        }

        let result = clean;
        if (clean.length > 4) {
            result = clean.slice(0, 4) + '-' + clean.slice(4);
        }
        if (result.length > 7) {
            result = result.slice(0, 7) + '-' + result.slice(7, 11);
        }
        setFormData(prev => ({ ...prev, idNumber: result.slice(0, 12) }));
    };

    const fetchUsers = async (page: number, search: string = searchQuery) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            const res = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=10&search=${search}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setUsers(result.data);
                    setTotalPages(result.pagination.pages);
                    setCurrentPage(result.pagination.currentPage);
                }
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userDataString || !token) {
            router.push('/auth/login');
            return;
        }

        const userData = JSON.parse(userDataString);
        if (!userData.isAdmin) {
            router.push('/home');
            return;
        }

        fetchUsers(1);
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('User created successfully');
                setIsAddModalOpen(false);
                setFormData({ name: '', idNumber: '', birthdate: '', password: '', isAdmin: false });
                fetchUsers(1);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create user');
            }
        } catch (err) {
            toast.error('Error creating user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { password, ...dataToSubmit } = formData as any;
            const payload = formData.password ? formData : dataToSubmit;

            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('User updated successfully');
                setIsEditModalOpen(false);
                fetchUsers(currentPage);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to update user');
            }
        } catch (err) {
            toast.error('Error updating user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            idNumber: user.idNumber,
            birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
            password: '',
            isAdmin: user.isAdmin
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('User deleted successfully');
                fetchUsers(currentPage);
            } else {
                toast.error('Failed to delete user');
            }
        } catch (err) {
            toast.error('Error deleting user');
        }
    };

    const toggleAdminStatus = async (user: any) => {
        const action = user.isAdmin ? 'remove' : 'make';
        if (!confirm(`Are you sure you want to ${action} this user an administrator?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAdmin: !user.isAdmin })
            });

            if (res.ok) {
                toast.success(`Updated ${user.name}'s status`);
                setUsers(users.map(u => u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u));
            } else {
                toast.error('Failed to update user status');
            }
        } catch (err) {
            toast.error('Error updating user status');
        }
    };

    if (loading && users.length === 0 && !searchQuery) {
        return <AdminTableSkeleton />;
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={fadeUpTransition}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
                >
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-4 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 text-white hover:bg-white/10 transition-all group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.35em] mb-4">Admin Panel</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                User <span className="text-primary">Management</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                        <div className="relative w-full sm:w-80">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search researchers..."
                                className="w-full pl-12 pr-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 shadow-xl font-bold text-sm transition-all placeholder:text-white/40 text-white"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ name: '', idNumber: '', birthdate: '', password: '', isAdmin: false });
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-teal-900/20 active:scale-95"
                        >
                            <FaPlus className="text-sm" /> Add User
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ ...fadeUpTransition, delay: 0.2 }}
                    className="bg-card rounded-2xl shadow-2xl border border-border-custom overflow-hidden mb-12 backdrop-blur-md"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">User Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">ID Number</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">Role</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">Joined</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border transition-colors ${user.isAdmin ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-white/20 border-white/5 group-hover:bg-white/10'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-[15px] mb-1 group-hover:text-primary transition-colors">{user.name}</p>
                                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-2">
                                                        <FaUser className="text-[9px] opacity-40" />
                                                        {user.birthdate ? new Date(user.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className="font-mono text-[11px] font-black text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                {user.idNumber}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border shadow-sm ${user.isAdmin ? 'bg-primary/5 text-primary border-primary/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
                                                {user.isAdmin ? <FaUserShield className="text-[10px]" /> : <FaUser className="text-[10px]" />}
                                                {user.isAdmin ? 'Administrator' : 'Researcher'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white/60">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Join Date</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-3 bg-white/5 text-white/40 hover:text-primary rounded-xl shadow-lg border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1"
                                                    title="Edit Record"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleAdminStatus(user)}
                                                    className={`p-3 bg-white/5 rounded-xl shadow-lg border border-white/5 transition-all hover:-translate-y-1 ${user.isAdmin ? 'text-primary border-primary/20' : 'text-white/40 hover:text-primary hover:border-primary/20'}`}
                                                    title={user.isAdmin ? "Revoke Privileges" : "Grant Privileges"}
                                                >
                                                    <FaUserShield className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-3 bg-white/5 text-white/40 hover:text-red-500 rounded-xl shadow-lg border border-white/5 hover:border-red-500/20 transition-all hover:-translate-y-1"
                                                    title="Delete User"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-20">
                                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
                                                    <FaUsers className="text-4xl text-white" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-white">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ ...fadeUpTransition, delay: 0.3 }}
                        className="flex items-center justify-between bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/[0.05]"
                    >
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-white/60">Page {currentPage}</span>
                            <span>/</span>
                            <span>{totalPages} Total</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchUsers(currentPage - 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchUsers(currentPage + 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Modals are already styled with high contrast, but I'll ensure they match the rounded-[2.5rem] style */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md" 
                            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1A1A2E]/90 backdrop-blur-2xl w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight mb-0.5">New User</h2>
                                    <p className="text-[9px] text-primary/60 font-medium uppercase tracking-[0.2em]">Create a new account</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"><FaTimes className="text-sm" /></button>
                            </div>
                            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Full Name</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20"
                                            placeholder="Enter researcher name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Academic Serial ID</label>
                                        <input
                                            type="text" required
                                            value={formData.idNumber}
                                            onChange={(e) => handleIDNumberChange(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20"
                                            placeholder="TUPT-XX-XXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Date of Birth</label>
                                        <input
                                            type="date" required
                                            value={formData.birthdate}
                                            onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white invert-[0.8] brightness-[0.8]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Initial Password</label>
                                        <input
                                            type="password" required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20"
                                            placeholder="Set secure password"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <input
                                            type="checkbox"
                                            id="isAdmin"
                                            checked={formData.isAdmin}
                                            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                            className="w-5 h-5 text-primary bg-white/5 border-white/10 rounded focus:ring-primary/40 focus:ring-offset-0 transition-all"
                                        />
                                        <div>
                                            <label htmlFor="isAdmin" className="block text-[11px] font-bold text-primary/80 uppercase tracking-wider mb-0.5">Admin Privileges</label>
                                            <p className="text-[9px] text-primary/40 font-medium uppercase tracking-tight">Grant full moderation access</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isSubmitting ? 'Saving...' : 'Add User'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md" 
                            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1A1A2E]/90 backdrop-blur-2xl w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight mb-0.5">Edit User</h2>
                                    <p className="text-[9px] text-primary/60 font-medium uppercase tracking-[0.2em]">Update user details</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"><FaTimes className="text-sm" /></button>
                            </div>
                            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Update Identity Name</label>
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">ID Verification</label>
                                        <input
                                            type="text" required
                                            value={formData.idNumber}
                                            onChange={(e) => handleIDNumberChange(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Record Date of Birth</label>
                                        <input
                                            type="date" required
                                            value={formData.birthdate}
                                            onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white invert-[0.8] brightness-[0.8]"
                                        />
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                id="isAdminEdit"
                                                checked={formData.isAdmin}
                                                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                                className="w-5 h-5 text-primary bg-white/5 border-white/10 rounded focus:ring-primary/40 focus:ring-offset-0 transition-all"
                                            />
                                            <div>
                                                <label htmlFor="isAdminEdit" className="block text-[11px] font-bold text-primary/80 uppercase tracking-wider mb-0.5">Admin Access</label>
                                                <p className="text-[9px] text-primary/40 font-medium uppercase tracking-tight">Toggle full oversight rights</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
