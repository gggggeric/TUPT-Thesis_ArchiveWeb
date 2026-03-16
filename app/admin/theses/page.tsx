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
        abstract: '',
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
                setFormData({ title: '', abstract: '', author: '', year_range: '', category: '', isApproved: true });
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
            abstract: thesis.abstract || '',
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
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2DD4BF]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-foreground selection:bg-[#2DD4BF] selection:text-white relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DD4BF]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-card/400/5 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader isLanding={false} />

            <main className="flex-1 relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-4 bg-card/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 text-white hover:bg-card/20 transition-all group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Thesis Moderation</h1>
                            <p className="text-[11px] text-white/60 font-black uppercase tracking-[0.2em]">Manage and review platform archives</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-full sm:w-80">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title or author..."
                                className="w-full pl-12 pr-6 py-4 bg-card/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-white/5 focus:border-white/20 shadow-xl font-bold text-sm transition-all placeholder:text-white/40 text-white"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', abstract: '', author: '', year_range: '', category: '', isApproved: true });
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#2DD4BF] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-teal-900/40 active:scale-95"
                        >
                            <FaPlus className="text-sm" /> Add New Entry
                        </button>
                    </div>
                </div>

                <div className="bg-card/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-border-custom overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface/50">
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-border-custom">Project Identification</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-border-custom">Category</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-border-custom">Status</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-border-custom">Date Logged</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-border-custom text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {theses.length > 0 ? theses.map((thesis) => (
                                    <tr key={thesis._id} className="hover:bg-surface/30 transition-all group">
                                        <td className="px-8 py-8 max-w-xl">
                                            <div className="flex items-start gap-5">
                                                <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border ${thesis.isApproved ? 'bg-card/40 text-green-600 border-border-custom' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    <FaFileAlt />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-foreground text-sm mb-2 leading-tight group-hover:text-[#2DD4BF] transition-colors">{thesis.title}</p>
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <span className="text-[10px] text-text-dim font-black flex items-center gap-2 uppercase tracking-widest">
                                                            <FaUserGraduate className="text-[#2DD4BF]" /> {thesis.author || 'Anonymous'}
                                                        </span>
                                                        <span className="text-[10px] text-text-dim font-black flex items-center gap-2 uppercase tracking-widest">
                                                            <FaCalendarAlt className="text-[#2DD4BF]" /> {thesis.year_range || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className="px-4 py-1.5 bg-gray-100/50 text-text-dim font-black uppercase tracking-widest text-[9px] rounded-full border border-border-custom shadow-sm">
                                                {thesis.category || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border shadow-sm ${thesis.isApproved ? 'bg-card/40 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${thesis.isApproved ? 'bg-card/400' : 'bg-amber-500 animate-pulse'}`} />
                                                {thesis.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-text-dim">{new Date(thesis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Automated Log</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-4 lg:group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(thesis)}
                                                    className="p-3 bg-card text-gray-400 hover:text-blue-600 rounded-xl shadow-lg border border-border-custom hover:border-border-custom transition-all hover:-translate-y-1"
                                                    title="Edit Technical Details"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleApprovalStatus(thesis)}
                                                    className={`p-3 bg-card rounded-xl shadow-lg border border-border-custom transition-all hover:-translate-y-1 ${thesis.isApproved ? 'text-amber-600 hover:border-amber-100' : 'text-green-600 hover:border-border-custom'}`}
                                                    title={thesis.isApproved ? "Revoke Approval" : "Grant Approval"}
                                                >
                                                    {thesis.isApproved ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteThesis(thesis._id)}
                                                    className="p-3 bg-card text-gray-400 hover:text-teal-700 rounded-xl shadow-lg border border-border-custom hover:border-teal-100 transition-all hover:-translate-y-1"
                                                    title="Purge Entry"
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
                                                <div className="w-20 h-20 bg-border-custom rounded-full flex items-center justify-center">
                                                    <FaFileAlt className="text-4xl" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.3em] text-[11px]">Archive is currently empty</p>
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
                    <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20">
                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span className="px-3 py-1 bg-card rounded-full border border-border-custom shadow-sm text-foreground">Page {currentPage}</span>
                            <span>of</span>
                            <span>{totalPages} Total</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchTheses(currentPage - 1)}
                                className="p-4 bg-card rounded-2xl border border-border-custom shadow-xl text-text-dim disabled:opacity-30 disabled:cursor-not-allowed hover:bg-teal-50 hover:text-[#2DD4BF] transition-all active:scale-90"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchTheses(currentPage + 1)}
                                className="p-4 bg-card rounded-2xl border border-border-custom shadow-xl text-text-dim disabled:opacity-30 disabled:cursor-not-allowed hover:bg-teal-50 hover:text-[#2DD4BF] transition-all active:scale-90"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Thesis Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="fixed inset-0 bg-primary/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)}></div>
                    <div className="relative bg-card w-full max-w-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-border-custom overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 ease-out">
                        <div className="p-6 md:p-10 border-b border-border-custom flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">New Thesis Log</h2>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Add technical documentation entry</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-primary transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreateThesis} className="p-6 md:p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Project Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#2DD4BF]/5 focus:border-[#2DD4BF] transition-all font-bold text-sm shadow-sm"
                                        placeholder="Electronic Thesis and Dissertation Archive..."
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Thesis Abstract</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.abstract}
                                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                        className="w-full px-6 py-6 bg-surface border border-border-custom rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-[#2DD4BF]/5 focus:border-[#2DD4BF] transition-all font-bold text-sm shadow-sm leading-relaxed resize-none"
                                        placeholder="Detailed technical abstract goes here..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Lead Author</label>
                                        <div className="relative">
                                            <FaUserGraduate className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DD4BF] opacity-50 text-sm" />
                                            <input
                                                type="text" required
                                                value={formData.author}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#2DD4BF]/5 focus:border-[#2DD4BF] transition-all font-bold text-sm shadow-sm"
                                                placeholder="Researcher name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Academic Year</label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DD4BF] opacity-50 text-sm" />
                                            <input
                                                type="text" required
                                                value={formData.year_range}
                                                onChange={(e) => setFormData({ ...formData, year_range: e.target.value })}
                                                className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#2DD4BF]/5 focus:border-[#2DD4BF] transition-all font-bold text-sm shadow-sm"
                                                placeholder="e.g. 2024-2025"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Area of Study / Department</label>
                                    <div className="relative">
                                        <FaLayerGroup className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2DD4BF] opacity-50 text-sm" />
                                        <input
                                            type="text" required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#2DD4BF]/5 focus:border-[#2DD4BF] transition-all font-bold text-sm shadow-sm"
                                            placeholder="e.g. Mechanical Engineering"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 bg-[#2DD4BF]/5 rounded-[1.5rem] border border-teal-900/10">
                                    <input
                                        type="checkbox"
                                        id="isApproved"
                                        checked={formData.isApproved}
                                        onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                                        className="w-6 h-6 text-[#2DD4BF] rounded-[0.5rem] focus:ring-[#2DD4BF] border-gray-300"
                                    />
                                    <div>
                                        <label htmlFor="isApproved" className="block text-[11px] font-black text-teal-900 uppercase tracking-widest mb-0.5">Automated Approval</label>
                                        <p className="text-[9px] text-teal-700/60 font-bold uppercase tracking-wider">Bypass moderation queue on creation</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-5 bg-[#2DD4BF] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl shadow-teal-900/30 disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmitting ? 'Processing Submission...' : 'Publish Entry to Archive'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Thesis Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                    <div className="fixed inset-0 bg-primary/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>
                    <div className="relative bg-card w-full max-w-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-border-custom overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 ease-out">
                        <div className="p-6 md:p-10 border-b border-border-custom flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight mb-1">Update Technical Entry</h2>
                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Administrative modification mode</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-gray-400 hover:bg-card/40 hover:text-blue-600 transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleUpdateThesis} className="p-6 md:p-10 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                <div className="lg:col-span-3 space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Project Title</label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-6 py-5 bg-surface border border-border-custom rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm shadow-sm leading-tight resize-none"
                                            placeholder="Revised Project Title..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Detailed Abstract</label>
                                        <textarea
                                            required
                                            rows={12}
                                            value={formData.abstract}
                                            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                            className="w-full px-6 py-6 bg-surface border border-border-custom rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm shadow-sm leading-relaxed resize-none"
                                            placeholder="Modified abstract content..."
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-dim uppercase tracking-widest mb-3 ml-2">Technical Metadata</label>
                                        <div className="space-y-6">
                                            <div className="relative">
                                                <FaUserGraduate className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 opacity-50 text-sm" />
                                                <input
                                                    type="text" required
                                                    value={formData.author}
                                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm"
                                                    placeholder="Author"
                                                />
                                            </div>
                                            <div className="relative">
                                                <FaCalendarAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 opacity-50 text-sm" />
                                                <input
                                                    type="text" required
                                                    value={formData.year_range}
                                                    onChange={(e) => setFormData({ ...formData, year_range: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm"
                                                    placeholder="Year"
                                                />
                                            </div>
                                            <div className="relative">
                                                <FaLayerGroup className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 opacity-50 text-sm" />
                                                <input
                                                    type="text" required
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-4 bg-surface border border-border-custom rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-sm"
                                                    placeholder="Category"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-card/40 rounded-[2rem] border border-border-custom">
                                        <div className="flex items-center gap-4 mb-3">
                                            <input
                                                type="checkbox"
                                                id="isApprovedEdit"
                                                checked={formData.isApproved}
                                                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded-[0.4rem] focus:ring-blue-500"
                                            />
                                            <label htmlFor="isApprovedEdit" className="text-[11px] font-black text-blue-800 uppercase tracking-widest">Verified Status</label>
                                        </div>
                                        <p className="text-[9px] text-blue-600/70 font-bold uppercase tracking-wider leading-relaxed">
                                            Manually override the verification status of this archival entry.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/30 disabled:opacity-50 active:scale-95"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Update Archive'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
