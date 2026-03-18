'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBook, FaPlus, FaSearch, FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaFileAlt, FaCalendarAlt, FaUserGraduate, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        year: new Date().getFullYear().toString(),
        department: '',
        abstract: '',
        tags: '',
        fileUrl: ''
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
                setTheses(data.theses);
                setTotalTheses(data.total);
                setTotalPages(data.pages);
                setCurrentPage(data.currentPage);
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

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userDataString || !token) {
            window.location.href = '/auth/login';
            return;
        }

        const userData = JSON.parse(userDataString);
        if (!userData.isAdmin) {
            window.location.href = '/user/home';
            return;
        }

        fetchTheses(1);
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
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                })
            });

            if (res.ok) {
                toast.success('Thesis archived successfully');
                setIsAddModalOpen(false);
                setFormData({ title: '', author: '', year: new Date().getFullYear().toString(), department: '', abstract: '', tags: '', fileUrl: '' });
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
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
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
            title: thesis.title,
            author: thesis.author,
            year: thesis.year.toString(),
            department: thesis.department,
            abstract: thesis.abstract,
            tags: thesis.tags.join(', '),
            fileUrl: thesis.fileUrl || ''
        });
        setIsEditModalOpen(true);
    };

    if (loading && theses.length === 0 && !searchQuery) {
        return (
            <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="p-4 bg-card/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 text-white hover:bg-card/20 transition-all group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1">Thesis Archive</h1>
                            <p className="text-[11px] text-white/60 font-black uppercase tracking-[0.2em]">Manage and curate research documents</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-full sm:w-80">
                            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search titles, authors..."
                                className="w-full pl-12 pr-6 py-4 bg-card/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-white/5 focus:border-white/20 shadow-xl font-bold text-sm transition-all text-white placeholder:text-white/40"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', author: '', year: new Date().getFullYear().toString(), department: '', abstract: '', tags: '', fileUrl: '' });
                                setIsAddModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#2DD4BF] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-teal-900/40 active:scale-95"
                        >
                            <FaPlus className="text-sm" /> Archive New Thesis
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5">Document Details</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5">Origin / Department</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5">Publication</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 border-b border-white/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {theses.length > 0 ? theses.map((thesis) => (
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
                                                <span className="text-xs font-black text-white/70 uppercase tracking-tight">{thesis.department}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-3">
                                                <FaCalendarAlt className="text-white/20 text-xs" />
                                                <span className="text-xs font-black text-white/60">{thesis.year}</span>
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
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-white">Page {currentPage} of {totalPages}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchTheses(currentPage - 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/10 transition-all active:scale-90"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchTheses(currentPage + 1)}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white disabled:opacity-20 hover:bg-white/10 transition-all active:scale-90"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal - Simplified for brevity but functional */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => { if (!isSubmitting) { setIsAddModalOpen(false); setIsEditModalOpen(false); } }}></div>
                    <div className="relative bg-[#1A1A2E] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 text-white">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{isAddModalOpen ? 'Archive New Research' : 'Modify Research Data'}</h2>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Registry overflow control system</p>
                            </div>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:bg-white/10 transition-all"><FaTimes /></button>
                        </div>
                        <form onSubmit={isAddModalOpen ? handleCreateThesis : handleUpdateThesis} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Thesis Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm" placeholder="The title of the research paper" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Lead Author</label>
                                <input type="text" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm" placeholder="Full name" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Year Level / Batch</label>
                                <input type="number" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Department</label>
                                <select required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm">
                                    <option value="">Select Department</option>
                                    <option value="COE">Engineering</option>
                                    <option value="CIT">Industrial Technology</option>
                                    <option value="CIE">Industrial Education</option>
                                    <option value="CLA">Liberal Arts</option>
                                    <option value="COS">Science</option>
                                    <option value="CAFA">Fine Arts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Tags (Comma Separated)</label>
                                <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm" placeholder="AI, Machine Learning, Web" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 ml-2">Abstract / Summary</label>
                                <textarea required value={formData.abstract} onChange={(e) => setFormData({...formData, abstract: e.target.value})} rows={4} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:border-primary transition-all text-white font-bold text-sm resize-none" placeholder="Brief overview of the research..."></textarea>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95">
                                    {isSubmitting ? 'Processing Document...' : (isAddModalOpen ? 'Commit to Archive' : 'Update Registry Entry')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
