'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBook, FaPlus, FaSearch, FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaFileAlt, FaCalendarAlt, FaUserGraduate, FaBuilding } from 'react-icons/fa';
import AdminTableSkeleton from '@/app/components/UI/skeleton_loaders/admin/AdminTableSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const fadeUpTransition = {
    duration: 0.5,
    ease: "easeOut" as any,
};

export default function AdminThesesPage() {
    const router = useRouter();
    const [theses, setTheses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalTheses, setTotalTheses] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingThesis, setEditingThesis] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        author: '',
        year_range: new Date().getFullYear().toString(),
        category: '',
        abstract: ''
    });

    const fetchTheses = async (page: number = 1, search: string = searchQuery, sort: string = sortBy) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses?page=${page}&limit=10&search=${search}&sort=${sort}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setTheses(data.data || []);
                    setTotalTheses(data.pagination?.total || 0);
                    setTotalPages(data.pagination?.pages || 1);
                    setCurrentPage(data.pagination?.currentPage || 1);
                } else {
                    toast.error(data.message || 'Failed to fetch theses');
                }
            } else {
                toast.error('Failed to fetch theses');
            }
        } catch (err) {
            console.error('Error fetching theses:', err);
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/thesis/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Remove 'all' if it's there
                setCategories(Array.isArray(data) ? data.filter(c => c !== 'all') : []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userDataString || !token) {
            window.location.href = '/auth/login';
            return;
        }

        const userData = JSON.parse(userDataString);
        if (!userData.isAdmin) {
            window.location.href = '/home';
            return;
        }

        fetchTheses(1);
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTheses(1, searchQuery, sortBy);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, sortBy]);

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
                body: JSON.stringify({
                    ...formData
                })
            });

            if (res.ok) {
                toast.success('Thesis archived successfully');
                setIsAddModalOpen(false);
                setFormData({ id: '', title: '', author: '', year_range: new Date().getFullYear().toString(), category: '', abstract: '' });
                fetchTheses(1);
            } else {
                toast.error('Failed to archive thesis');
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
                body: JSON.stringify({
                    ...formData
                })
            });

            if (res.ok) {
                toast.success('Thesis updated successfully');
                setIsEditModalOpen(false);
                fetchTheses(currentPage);
            } else {
                toast.error('Failed to update thesis');
            }
        } catch (err) {
            toast.error('Error updating thesis');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteThesis = async (id: string) => {
        if (!confirm('Are you sure you want to delete this thesis?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/theses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Thesis deleted');
                fetchTheses(currentPage);
            } else {
                toast.error('Failed to delete thesis');
            }
        } catch (err) {
            toast.error('Error deleting thesis');
        }
    };

    const openEditModal = (thesis: any) => {
        setEditingThesis(thesis);
        setFormData({
            id: thesis.id || '',
            title: thesis.title,
            author: thesis.author,
            year_range: (thesis.year_range || thesis.year || '').toString(),
            category: thesis.category || thesis.department || '',
            abstract: thesis.abstract
        });
        setIsEditModalOpen(true);
    };

    if (loading && (!theses || theses.length === 0) && !searchQuery) {
        return <AdminTableSkeleton />;
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={fadeUpTransition}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12"
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
                                Thesis <span className="text-primary">Management</span>
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
                                placeholder="Search theses..."
                                className="w-full pl-12 pr-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 shadow-xl font-bold text-sm transition-all placeholder:text-white/40 text-white"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ id: '', title: '', author: '', year_range: new Date().getFullYear().toString(), category: '', abstract: '' });
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-xl shadow-teal-900/20 active:scale-95"
                        >
                            <FaPlus className="text-sm" /> Add Thesis
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
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">Thesis Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">Department</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03]">Year</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.03] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {theses && theses.length > 0 ? theses.map((thesis) => (
                                    <tr key={thesis._id} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 shadow-inner">
                                                    <FaFileAlt className="text-xl" />
                                                </div>
                                                <div className="max-w-md">
                                                    <p className="font-black text-white text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{thesis.title}</p>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-2">
                                                        <FaUserGraduate className="text-[10px]" />
                                                        {thesis.author}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                    <FaBuilding className="text-xs" />
                                                </div>
                                                 <span className="text-xs font-black text-white uppercase tracking-tight">{thesis.category || thesis.department || 'General'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-3">
                                                <FaCalendarAlt className="text-white/20 text-xs" />
                                                <span className="text-xs font-black text-white/60">{thesis.year_range || thesis.year}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => openEditModal(thesis)}
                                                    className="p-3 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:-translate-y-1"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteThesis(thesis._id)}
                                                    className="p-3 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-white/10 transition-all hover:-translate-y-1"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <FaBook className="text-6xl" />
                                                <p className="font-black uppercase tracking-[0.3em] text-[11px]">No research papers found</p>
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
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-white/60">Page {currentPage} of {totalPages}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchTheses(currentPage - 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchTheses(currentPage + 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-90"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); setIsEditModalOpen(false); } }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1A1A2E]/90 backdrop-blur-2xl w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight mb-0.5">{isAddModalOpen ? 'Add Thesis' : 'Edit Thesis'}</h2>
                                    <p className="text-[9px] text-primary/60 font-medium uppercase tracking-[0.2em]">{isAddModalOpen ? 'Archive a new research paper' : 'Update thesis details'}</p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"><FaTimes className="text-sm" /></button>
                            </div>
                            <form onSubmit={isAddModalOpen ? handleCreateThesis : handleUpdateThesis} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Thesis Title</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20" placeholder="The title of the research paper" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Author</label>
                                    <input type="text" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20" placeholder="Full name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Thesis ID</label>
                                    <input type="text" required value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20 disabled:opacity-50" placeholder="e.g. TH-2025-001" disabled={isEditModalOpen} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Year / Batch</label>
                                    <input type="text" required value={formData.year_range} onChange={(e) => setFormData({...formData, year_range: e.target.value})} className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Department</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list="category-suggestions"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20"
                                            placeholder="Type or select department"
                                        />
                                        <datalist id="category-suggestions">
                                            {categories.map((cat, i) => (
                                                <option key={i} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 ml-1">Abstract</label>
                                    <textarea required value={formData.abstract} onChange={(e) => setFormData({...formData, abstract: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm text-white placeholder:text-white/20 resize-none leading-relaxed" placeholder="Brief overview of the research..."></textarea>
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50 active:scale-[0.98]">
                                        {isSubmitting ? 'Saving...' : (isAddModalOpen ? 'Add Thesis' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
