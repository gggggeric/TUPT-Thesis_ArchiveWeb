'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHandshake, FaUser, FaFileAlt, FaCheck, FaTimes, FaClock, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/app/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const fadeUpTransition: any = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
};

export default function AdminCollaborationPage() {
    const router = useRouter();
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollaborations();
    }, []);

    const fetchCollaborations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/admin/collaborations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCollaborations(data.data);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch collaborations');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminStatus = async (id: string, status: 'approved' | 'declined') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration/${id}/admin-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Collaboration ${status} successfully`);
                fetchCollaborations();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto w-full">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 w-64 bg-white/5 rounded-xl" />
                    <div className="h-96 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto w-full relative z-10">
            {/* Header */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={fadeUpTransition}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5 mb-12"
            >
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        Collaboration <span className="text-primary italic">Requests</span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
                        Manage and approve research collaboration requests between graduates and students.
                    </p>
                </div>
            </motion.div>

            {/* List */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ ...fadeUpTransition, delay: 0.2 }}
                className="bg-card rounded-2xl border border-border-custom shadow-2xl overflow-hidden backdrop-blur-md"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.03]">
                                <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Requester (Alumni)</th>
                                <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Receiver (Undergrad)</th>
                                <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Thesis</th>
                                <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Admin Status</th>
                                <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {collaborations.length > 0 ? (
                                collaborations.map((collab) => (
                                    <tr key={collab._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 overflow-hidden">
                                                    {collab.alumni.profilePhoto ? (
                                                        <img 
                                                            src={collab.alumni.profilePhoto.startsWith('http') ? collab.alumni.profilePhoto : `${API_BASE_URL}${collab.alumni.profilePhoto}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <FaUser />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{collab.alumni.name}</p>
                                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{collab.alumni.idNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 overflow-hidden">
                                                    {collab.undergrad.profilePhoto ? (
                                                        <img 
                                                            src={collab.undergrad.profilePhoto.startsWith('http') ? collab.undergrad.profilePhoto : `${API_BASE_URL}${collab.undergrad.profilePhoto}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <FaUser />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{collab.undergrad.name}</p>
                                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{collab.undergrad.idNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors cursor-pointer max-w-xs" onClick={() => router.push(`/admin/theses`)}>
                                                <FaFileAlt className="text-xs flex-shrink-0" />
                                                <p className="text-[11px] font-bold truncate">{collab.thesis.title}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border
                                                ${collab.adminStatus === 'approved' ? 'bg-primary/5 text-primary border-primary/20' : 
                                                  collab.adminStatus === 'declined' ? 'bg-red-500/5 text-red-500 border-red-500/20' : 
                                                  'bg-amber-500/5 text-amber-500 border-amber-500/20'}`}>
                                                {collab.adminStatus}
                                            </span>
                                            {collab.adminStatus === 'approved' && (
                                                <div className="mt-2">
                                                    <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em]">Receiver: {collab.status}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            {collab.adminStatus === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleAdminStatus(collab._id, 'approved')}
                                                        className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                                        title="Approve"
                                                    >
                                                        <FaCheck className="text-xs" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAdminStatus(collab._id, 'declined')}
                                                        className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                                        title="Decline"
                                                    >
                                                        <FaTimes className="text-xs" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 ml-auto">
                                                    Processed <FaArrowRight />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center flex flex-col items-center justify-center opacity-20">
                                        <FaHandshake className="text-5xl mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No collaboration requests found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </main>
    );
}
