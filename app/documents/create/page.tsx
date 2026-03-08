'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';

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
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900 selection:bg-[#8b0000] selection:text-white">
            <CustomHeader onMenuPress={() => setMenuVisible(!menuVisible)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#8b0000]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 w-full pt-32 px-6 max-w-4xl mx-auto pb-16">
                <button
                    onClick={() => router.push('/documents')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-12"
                >
                    <FaArrowLeft /> Back to Documents
                </button>

                <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl shadow-black/20 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

                    <div className="relative z-10 mb-12 border-b border-white/10 pb-8">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Submit Document</h1>
                        <p className="text-xs font-bold text-[#fecaca] uppercase tracking-widest">Upload New Document</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#fecaca] mb-3">Research Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/20"
                                placeholder="Enter full thesis title"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#fecaca] mb-3">Author</label>
                            <input
                                type="text"
                                required
                                value={formData.author}
                                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/20"
                                placeholder="Last Name, First Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fecaca] mb-3">Publication Year</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.year_range}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year_range: e.target.value }))}
                                    className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium outline-none shadow-sm text-white placeholder:text-white/20"
                                    placeholder="e.g. 2023-2024"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fecaca] mb-3">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium outline-none appearance-none shadow-sm text-white"
                                >
                                    <option value="">Select Domain</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Education">Education</option>
                                    <option value="Arts & Sciences">Arts & Sciences</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#fecaca] mb-3">Abstract</label>
                            <textarea
                                required
                                value={formData.abstract}
                                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium outline-none min-h-[200px] shadow-sm resize-y text-white placeholder:text-white/20"
                                placeholder="Paste the abstract here..."
                            />
                        </div>

                        <div className="pt-8 border-t border-white/10 flex justify-end gap-6 mt-12">
                            <button
                                type="button"
                                onClick={() => router.push('/documents')}
                                className="px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-white/40 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-12 py-5 rounded-[1.5rem] bg-white text-[#8b0000] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fecaca] transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
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
