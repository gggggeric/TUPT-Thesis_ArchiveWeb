'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomHeader from '@/components/Navigation/CustomHeader';
import { FaFileAlt, FaArrowLeft, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaUserGraduate, FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight, FaTimes, FaLayerGroup, FaSearch, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AdminThesesPage() {
    const router = useRouter();
    const [theses, setTheses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingThesis, setEditingThesis] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        year_range: '',
        category: '',
        isApproved: true
    });

    const fetchTheses = async (page: number, search: string = searchQuery) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            const res = await fetch(`${API_BASE_URL}/admin/theses?page=${page}&limit=10&search=${search}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setTheses(result.data);
                    setTotalPages(result.pagination.pages);
                    setCurrentPage(result.pagination.currentPage);
                }
            } else {
                toast.error('Failed to fetch theses');
            }
        } catch (err) {
            console.error('Error fetching theses:', err);
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

        fetchTheses(1);
    }, [router]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTheses(1, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateThesis = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Thesis created successfully');
                setIsAddModalOpen(false);
                setFormData({ title: '', author: '', year_range: '', category: '', isApproved: true });
                fetchTheses(1);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create thesis');
            }
        } catch (err) {
            toast.error('Error creating thesis');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateThesis = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses/${editingThesis._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Thesis updated successfully');
                setIsEditModalOpen(false);
                fetchTheses(currentPage);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to update thesis');
            }
        } catch (err) {
            toast.error('Error updating thesis');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (thesis: any) => {
        setEditingThesis(thesis);
        setFormData({
            title: thesis.title,
            author: thesis.author || '',
            year_range: thesis.year_range || '',
            category: thesis.category || '',
            isApproved: thesis.isApproved
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteThesis = async (thesisId: string) => {
        if (!confirm('Are you sure you want to delete this thesis? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses/${thesisId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Thesis deleted successfully');
                fetchTheses(currentPage);
            } else {
                toast.error('Failed to delete thesis');
            }
        } catch (err) {
            toast.error('Error deleting thesis');
        }
    };

    const toggleApprovalStatus = async (thesis: any) => {
        const newStatus = !thesis.isApproved;
        const action = newStatus ? 'approve' : 'unapprove';
        if (!confirm(`Are you sure you want to ${action} this thesis?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses/${thesis._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isApproved: newStatus })
            });

            if (res.ok) {
                toast.success(`Thesis ${newStatus ? 'Approved' : 'Unapproved'}`);
                setTheses(theses.map(t => t._id === thesis._id ? { ...t, isApproved: newStatus } : t));
            } else {
                toast.error('Failed to update thesis status');
            }
        } catch (err) {
            toast.error('Error updating thesis status');
        }
    };

    if (loading && theses.length === 0 && !searchQuery) {
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
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thesis Management</h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Review and moderate archive entries</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search title or author..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/10 focus:border-[#8b0000] shadow-sm font-bold text-sm transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', author: '', year_range: '', category: '', isApproved: true });
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#8b0000] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#a00000] transition-colors shadow-lg shadow-red-900/20 whitespace-nowrap"
                        >
                            <FaPlus /> Add New Thesis
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Thesis Title</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Department</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Created</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {theses.length > 0 ? theses.map((thesis) => (
                                    <tr key={thesis._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 max-w-md">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${thesis.isApproved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    <FaFileAlt />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{thesis.title}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                            <FaUserGraduate className="text-[8px]" /> {thesis.author || 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                            <FaCalendarAlt className="text-[8px]" /> {thesis.year_range || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[9px] rounded-md">
                                                {thesis.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${thesis.isApproved ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {thesis.isApproved ? <FaCheckCircle /> : <FaTimesCircle />}
                                                {thesis.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-400">
                                            {new Date(thesis.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(thesis)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Thesis"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleApprovalStatus(thesis)}
                                                    className={`p-2 rounded-lg transition-colors ${thesis.isApproved ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={thesis.isApproved ? "Unapprove" : "Approve"}
                                                >
                                                    {thesis.isApproved ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteThesis(thesis._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Thesis"
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
                                                <FaFileAlt className="text-4xl" />
                                                <p className="font-black uppercase tracking-[0.2em] text-xs">No theses found</p>
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
                                onClick={() => fetchTheses(currentPage - 1)}
                                className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchTheses(currentPage + 1)}
                                className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Thesis Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Add New Thesis</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateThesis} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Thesis Title</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm resize-none"
                                    placeholder="Enter thesis title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Author</label>
                                    <input
                                        type="text" required
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="Author name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Year Range</label>
                                    <input
                                        type="text" required
                                        value={formData.year_range}
                                        onChange={(e) => setFormData({ ...formData, year_range: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="e.g. 2023-2024"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category / Department</label>
                                <div className="relative">
                                    <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text" required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isApproved"
                                    checked={formData.isApproved}
                                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                                    className="w-4 h-4 text-[#8b0000] rounded focus:ring-[#8b0000]"
                                />
                                <label htmlFor="isApproved" className="text-xs font-black text-gray-700 uppercase tracking-widest">Mark as Approved</label>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#8b0000] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#a00000] transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Thesis Entry'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Thesis Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">Edit Thesis Entry</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateThesis} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Thesis Title</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm resize-none"
                                    placeholder="Enter thesis title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Author</label>
                                    <input
                                        type="text" required
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="Author name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Year Range</label>
                                    <input
                                        type="text" required
                                        value={formData.year_range}
                                        onChange={(e) => setFormData({ ...formData, year_range: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="e.g. 2023-2024"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category / Department</label>
                                <div className="relative">
                                    <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text" required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] transition-all font-bold text-sm"
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isApprovedEdit"
                                    checked={formData.isApproved}
                                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                                    className="w-4 h-4 text-[#8b0000] rounded focus:ring-[#8b0000]"
                                />
                                <label htmlFor="isApprovedEdit" className="text-xs font-black text-gray-700 uppercase tracking-widest">Mark as Approved</label>
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
