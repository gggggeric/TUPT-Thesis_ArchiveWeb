'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import DepartmentDropdown from '../components/DepartmentDropdown';

const DEPARTMENTS = [
    'BENG', 'BET', 'BETEM', 'BETICT', 'BETMC', 'BETMT', 'BETNT', 
    'BSCE', 'BSECE', 'BSEE', 'BSES', 'BSIT', 'BSME', 
    'BTAU', 'BTTE', 'BTVED', 'BTVTED'
];

const CreateDocumentPage: React.FC = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        author: '',
        year_range: '',
        category: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/theses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Thesis submitted for approval!');
                router.push('/documents');
            } else {
                toast.error('Failed to submit thesis');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-foreground selection:bg-[#2DD4BF] selection:text-white">
            <CustomHeader onMenuPress={() => setMenuVisible(!menuVisible)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#2DD4BF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 w-full pt-32 px-6 max-w-4xl mx-auto pb-16">
                <button
                    onClick={() => router.push('/documents')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-foreground transition-colors mb-12"
                >
                    <FaArrowLeft /> Back to Documents
                </button>

                <div className="bg-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-xl border border-border-custom relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />

                    <div className="relative z-10 mb-12 border-b border-border-custom pb-8">
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Submit Document</h1>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Upload New Document</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-3">Research Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-medium outline-none shadow-sm text-foreground placeholder:text-gray-400"
                                placeholder="Enter full thesis title"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-3">Author</label>
                            <input
                                type="text"
                                required
                                value={formData.author}
                                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-medium outline-none shadow-sm text-foreground placeholder:text-gray-400"
                                placeholder="Last Name, First Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-3">Publication Year</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.year_range}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year_range: e.target.value }))}
                                    className="w-full px-8 py-5 rounded-2xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-medium outline-none shadow-sm text-foreground placeholder:text-gray-400"
                                    placeholder="e.g. 2023-2024"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-3">Department</label>
                                <DepartmentDropdown 
                                    value={formData.category}
                                    options={DEPARTMENTS}
                                    onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-3">Abstract</label>
                            <textarea
                                required
                                value={formData.abstract}
                                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-medium outline-none min-h-[200px] shadow-sm resize-y text-foreground placeholder:text-gray-400"
                                placeholder="Paste the abstract here..."
                            />
                        </div>

                        <div className="pt-8 border-t border-border-custom flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 mt-12">
                            <button
                                type="button"
                                onClick={() => router.push('/documents')}
                                className="px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-text-dim hover:bg-surface hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto px-12 py-5 rounded-[1.5rem] bg-[#2DD4BF] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="text-lg" /> Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CreateDocumentPage;
