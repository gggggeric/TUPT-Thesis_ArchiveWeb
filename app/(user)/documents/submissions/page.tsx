'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

import CustomHeader from '@/app/components/Navigation/CustomHeader';
import Sidebar from '@/app/components/Navigation/Sidebar';
import Footer from '@/app/components/Navigation/Footer';
import MySubmissions from '../components/MySubmissions';
import EditThesisModal from '../components/EditThesisModal';

const SubmissionsPage: React.FC = () => {
    const router = useRouter();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [myTheses, setMyTheses] = useState<any[]>([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedThesis, setSelectedThesis] = useState<any | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchUserTheses();
    }, []);

    const fetchUserTheses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMyTheses(data.data);
            }
        } catch (err) {
            console.error('Error fetching theses:', err);
        }
    };

    const handleEdit = (thesis: any) => {
        setSelectedThesis(thesis);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Submission deleted successfully');
                fetchUserTheses(); // Refresh list
            } else {
                toast.error('Failed to delete submission');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        }
    };

    const handleSaveEdit = async (id: string, updatedData: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                toast.success('Submission updated and pending re-approval');
                fetchUserTheses(); // Refresh list
            } else {
                toast.error('Failed to update submission');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#2DD4BF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 w-full pt-32 px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => router.push('/documents')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-[-40px] ml-6 relative z-20"
                    >
                        <FaArrowLeft /> Back to Workspace
                    </button>

                    {mounted && (
                        <MySubmissions
                            myTheses={myTheses}
                            onViewThesis={(id) => router.push(`/search_result?id=${id}`)}
                            onEditThesis={handleEdit}
                            onDeleteThesis={handleDelete}
                            hasAnalysisOrFile={false}
                        />
                    )}
                </div>
            </main>

            {mounted && (
                <EditThesisModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    thesis={selectedThesis}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
};

export default SubmissionsPage;
