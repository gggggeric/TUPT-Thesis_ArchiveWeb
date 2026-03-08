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
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b0000]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <CustomHeader isLanding={false} />

            <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Management</h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Manage system access and roles</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/10 focus:border-[#8b0000] shadow-sm font-bold text-sm transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ name: '', idNumber: '', birthdate: '', password: '', isAdmin: false });
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#8b0000] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#a00000] transition-colors shadow-lg shadow-red-900/20 whitespace-nowrap"
                        >
                            <FaPlus /> Add New User
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">User</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">ID Number</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Joined</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${user.isAdmin ? 'bg-[#8b0000]/10 text-[#8b0000]' : 'bg-blue-50 text-blue-600'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs font-bold text-gray-500">
                                            {user.idNumber}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${user.isAdmin ? 'bg-[#8b0000]/10 text-[#8b0000]' : 'bg-gray-100 text-gray-500'}`}>
                                                {user.isAdmin ? <FaUserShield /> : <FaUser />}
                                                {user.isAdmin ? 'Administrator' : 'Student'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleAdminStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isAdmin ? 'text-[#8b0000] hover:bg-[#8b0000]/10' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                                                >
                                                    <FaUserShield className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <FaUsers className="text-4xl" />
                                                <p className="font-black uppercase tracking-[0.2em] text-xs">No users found</p>
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
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchUsers(currentPage - 1)}
                                className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchUsers(currentPage + 1)}
                                className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Create User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Add New User</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ID Number</label>
                                <input
                                    type="text" required
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter ID number"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Birthdate</label>
                                <input
                                    type="date" required
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                                <input
                                    type="password" required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter initial password"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                    className="w-4 h-4 text-[#8b0000] rounded focus:ring-[#8b0000]"
                                />
                                <label htmlFor="isAdmin" className="text-xs font-black text-gray-700 uppercase tracking-widest">Set as Administrator</label>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#8b0000] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#a00000] transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create User Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Edit User Account</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ID Number</label>
                                <input
                                    type="text" required
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                    placeholder="Enter ID number"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Birthdate</label>
                                <input
                                    type="date" required
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isAdminEdit"
                                    checked={formData.isAdmin}
                                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                                    className="w-4 h-4 text-[#8b0000] rounded focus:ring-[#8b0000]"
                                />
                                <label htmlFor="isAdminEdit" className="text-xs font-black text-gray-700 uppercase tracking-widest">Administrator Access</label>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
