'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaHandshake, 
    FaCheck, 
    FaTimes, 
    FaClock, 
    FaUser, 
    FaBook, 
    FaEnvelopeOpenText,
    FaArrowRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CollaborationPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            fetchData(user);
        }
    }, []);

    const fetchData = async (user: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            if (user.isGraduate) {
                const res = await fetch(`${API_BASE_URL}/collaboration/my-requests`, { headers });
                const data = await res.json();
                if (res.ok) setMyRequests(data.data);
            } else {
                const res = await fetch(`${API_BASE_URL}/collaboration/incoming`, { headers });
                const data = await res.json();
                if (res.ok) setIncomingRequests(data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch collaboration data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/collaboration/${requestId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Request ${status} successfully`);
                setIncomingRequests(prev => prev.map(req => 
                    req._id === requestId ? { ...req, status } : req
                ));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update request');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'declined': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <FaCheck className="text-[10px]" />;
            case 'declined': return <FaTimes className="text-[10px]" />;
            default: return <FaClock className="text-[10px]" />;
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 pt-28">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <FaHandshake className="text-2xl text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Collaboration Portal</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Research Collaboration</p>
                        </div>
                    </motion.div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Loading requests...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Role-based View */}
                        {!currentUser?.isGraduate ? (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Incoming Requests</h2>
                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-lg border border-primary/20">
                                        {incomingRequests.length}
                                    </span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {incomingRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {incomingRequests.map((req, index) => (
                                                <motion.div
                                                    key={req._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-card border border-border-custom rounded-3xl p-6 hover:shadow-2xl hover:border-primary/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-xl bg-surface border border-border-custom flex items-center justify-center overflow-hidden">
                                                            {req.alumni?.profilePhoto ? (
                                                                <img src={req.alumni.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaUser className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-sm font-bold text-white truncate">{req.alumni?.name}</h3>
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Alumni / Graduate</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-surface/50 rounded-2xl p-4 border border-border-custom/50 mb-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FaBook className="text-[10px] text-gray-500" />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thesis Title</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-relaxed">
                                                            {req.thesis?.title}
                                                        </p>
                                                    </div>

                                                    <div className="mb-8">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <FaEnvelopeOpenText className="text-[10px] text-primary" />
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Message</span>
                                                        </div>
                                                        <p className="text-[12px] text-gray-400 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                                            "{req.message}"
                                                        </p>
                                                    </div>

                                                    {req.status === 'pending' ? (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req._id, 'declined')}
                                                                className="py-3 rounded-xl border border-white/5 hover:bg-red-500/10 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                Decline
                                                            </button>
                                                            <button 
                                                                onClick={() => handleUpdateStatus(req._id, 'accepted')}
                                                                className="bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                                            >
                                                                Accept Collaboration
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${getStatusStyle(req.status)} text-[10px] font-black uppercase tracking-widest`}>
                                                            {getStatusIcon(req.status)} {req.status}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 bg-card/10 rounded-3xl border border-dashed border-white/5 opacity-40">
                                            <FaClock className="text-4xl text-gray-500 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No active requests found</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </section>
                        ) : (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-sm font-black text-white uppercase tracking-widest">My Requests</h2>
                                    <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold rounded-lg border border-[#2DD4BF]/20">
                                        {myRequests.length}
                                    </span>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {myRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {myRequests.map((req, index) => (
                                                <motion.div
                                                    key={req._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-card border border-border-custom rounded-3xl p-6 hover:shadow-2xl hover:border-[#2DD4BF]/20 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`px-3 py-1.5 rounded-xl border ${getStatusStyle(req.status)} flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                                                            {getStatusIcon(req.status)} {req.status}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Proposal ID: {req._id.slice(-6)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-xl bg-surface border border-border-custom flex items-center justify-center overflow-hidden">
                                                            {req.undergrad?.profilePhoto ? (
                                                                <img src={req.undergrad.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaUser className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Request To</span>
                                                                <FaArrowRight className="text-[8px] text-gray-600" />
                                                            </div>
                                                            <h3 className="text-sm font-bold text-white truncate">{req.undergrad?.name}</h3>
                                                        </div>
                                                    </div>

                                                    <div className="bg-surface/50 rounded-2xl p-4 border border-border-custom/50 mb-6">
                                                        <p className="text-[11px] font-bold text-[#2DD4BF] line-clamp-2 leading-relaxed">
                                                            {req.thesis?.title}
                                                        </p>
                                                    </div>

                                                    <div className="pt-6 border-t border-white/5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sent Message</span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic line-clamp-3">
                                                            "{req.message}"
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 bg-card/10 rounded-3xl border border-dashed border-white/5 opacity-40">
                                            <FaHandshake className="text-4xl text-gray-500 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No active requests found</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
