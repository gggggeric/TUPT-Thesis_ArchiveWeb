'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomHeader from '@/components/Navigation/CustomHeader';
import { FaUsers, FaArrowLeft, FaUserShield, FaUser, FaTrash, FaCheckCircle, FaExclamationCircle, FaPlus, FaChevronLeft, FaChevronRight, FaTimes, FaSearch, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userDataString);
        if (!userData.isAdmin) {
            router.push('/home');
            return;
        }

        fetchUsers(1);
    }, [router]);

    // Debounced search
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
            // Filter out empty password so it doesn't overwrite with blank
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
            password: '', // Don't show password
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
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b0000]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900 selection:bg-[#8b0000] selection:text-white relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader isLanding={false} />

            <main className="flex-1 relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 text-white hover:bg-white/20 transition-all group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1">User Management</h1>
                            <p className="text-[11px] text-white/60 font-black uppercase tracking-[0.2em]">Manage system access and roles</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-full sm:w-80">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or ID..."
                                className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-white/5 focus:border-white/20 shadow-xl font-bold text-sm transition-all placeholder:text-white/40 text-white"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ name: '', idNumber: '', birthdate: '', password: '', isAdmin: false });
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#8b0000] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 active:scale-95"
                        >
                            <FaPlus className="text-sm" /> Add New User
                        </button>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">User Identification</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">ID Reference</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">System Role</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">Access Granted</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border ${user.isAdmin ? 'bg-[#8b0000]/10 text-[#8b0000] border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm mb-1 group-hover:text-[#8b0000] transition-colors">{user.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                                        <FaUser className="text-[10px] opacity-40" /> 
                                                        {user.birthdate ? new Date(user.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className="font-mono text-xs font-black text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                {user.idNumber}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border shadow-sm ${user.isAdmin ? 'bg-red-50 text-[#8b0000] border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {user.isAdmin ? <FaUserShield className="text-[10px]" /> : <FaUser className="text-[10px]" />}
                                                {user.isAdmin ? 'Administrator' : 'Student Account'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-700">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Automated Join</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-3 bg-white text-gray-400 hover:text-blue-600 rounded-xl shadow-lg border border-gray-100 hover:border-blue-100 transition-all hover:-translate-y-1"
                                                    title="Edit User Profile"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleAdminStatus(user)}
                                                    className={`p-3 bg-white rounded-xl shadow-lg border border-gray-100 transition-all hover:-translate-y-1 ${user.isAdmin ? 'text-[#8b0000] hover:border-red-100' : 'text-gray-400 hover:text-green-600 hover:border-green-100'}`}
                                                    title={user.isAdmin ? "Revoke Admin Rights" : "Grant Admin Rights"}
                                                >
                                                    <FaUserShield className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-3 bg-white text-gray-400 hover:text-red-700 rounded-xl shadow-lg border border-gray-100 hover:border-red-100 transition-all hover:-translate-y-1"
                                                    title="Purge User Account"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <FaUsers className="text-4xl" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.3em] text-[11px]">System Registry is Empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20">
                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span className="px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-gray-900">Page {currentPage}</span>
                            <span>of</span>
                            <span>{totalPages} Total</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchUsers(currentPage - 1)}
                                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xl text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-50 hover:text-[#8b0000] transition-all active:scale-90"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchUsers(currentPage + 1)}
                                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xl text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-50 hover:text-[#8b0000] transition-all active:scale-90"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Create User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 ease-out">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">New User Entry</h2>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Register technical system access</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Legal Identity / Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#8b0000]/5 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Academic / System ID</label>
                                <input
                                    type="text" required
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#8b0000]/5 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter ID reference"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Birth Record Date</label>
                                <input
                                    type="date" required
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#8b0000]/5 focus:border-[#8b0000] transition-all font-bold text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Access Credentials</label>
                                <input
                                    type="password" required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#8b0000]/5 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Set initial password"
                                />
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-[#8b0000]/5 rounded-[1.5rem] border border-red-900/10">
                                <input
                                    type="checkbox"
                                    id="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                    className="w-6 h-6 text-[#8b0000] rounded-[0.5rem] focus:ring-[#8b0000] border-gray-300"
                                />
                                <div>
                                    <label htmlFor="isAdmin" className="block text-[11px] font-black text-red-900 uppercase tracking-widest mb-0.5">Administrative Power</label>
                                    <p className="text-[9px] text-red-700/60 font-bold uppercase tracking-wider">Grant full system moderation rights</p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-[#8b0000] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-2xl shadow-red-900/30 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? 'Finalizing Registry...' : 'Initialize User Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 ease-out">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Modify User Profile</h2>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Administrative credential override</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Account Identity</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">ID Verification Reference</label>
                                <input
                                    type="text" required
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm"
                                    placeholder="ID number"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Date of Birth</label>
                                <input
                                    type="date" required
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm shadow-sm"
                                />
                            </div>
                            <div className="p-6 bg-blue-50 rounded-[1.5rem] border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <input
                                        type="checkbox"
                                        id="isAdminEdit"
                                        checked={formData.isAdmin}
                                        onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                        className="w-6 h-6 text-blue-600 rounded-[0.5rem] focus:ring-blue-500 border-gray-300"
                                    />
                                    <div>
                                        <label htmlFor="isAdminEdit" className="block text-[11px] font-black text-blue-900 uppercase tracking-widest mb-0.5">Admin Privileges</label>
                                        <p className="text-[9px] text-blue-700/60 font-bold uppercase tracking-wider">Toggle administrative system access</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/30 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? 'Syncing Profile...' : 'Authorize and Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
