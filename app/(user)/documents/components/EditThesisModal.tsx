'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DepartmentDropdown from './DepartmentDropdown';

interface Thesis {
    _id: string;
    title: string;
    abstract: string;
    author: string;
    year_range: string;
    category: string;
}

interface EditThesisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updatedData: Partial<Thesis>) => Promise<void>;
    thesis: Thesis | null;
}

const DEPARTMENTS = [
    'BENG', 'BET', 'BETEM', 'BETICT', 'BETMC', 'BETMT', 'BETNT', 
    'BSCE', 'BSECE', 'BSEE', 'BSES', 'BSIT', 'BSME', 
    'BTAU', 'BTTE', 'BTVED', 'BTVTED'
];

const EditThesisModal: React.FC<EditThesisModalProps> = ({ isOpen, onClose, onSave, thesis }) => {
    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        author: '',
        year_range: '',
        category: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (thesis) {
            setFormData({
                title: thesis.title,
                abstract: thesis.abstract,
                author: thesis.author,
                year_range: thesis.year_range,
                category: thesis.category
            });
        }
    }, [thesis]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!thesis) return;
        
        setIsSaving(true);
        await onSave(thesis._id, formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="px-8 py-6 border-b border-border-custom flex items-center justify-between bg-surface/50">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Edit Submission</h2>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Updates will require re-approval</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-card flex items-center justify-center text-gray-400 hover:text-foreground transition-all border border-transparent hover:border-border-custom shadow-sm"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 ml-1">Research Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-bold outline-none shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 ml-1">Author</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.author}
                                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                        className="w-full px-6 py-4 rounded-xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-bold outline-none shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 ml-1">Publication Year</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.year_range}
                                        onChange={(e) => setFormData(prev => ({ ...prev, year_range: e.target.value }))}
                                        className="w-full px-6 py-4 rounded-xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-bold outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 ml-1">Department</label>
                                <DepartmentDropdown 
                                    value={formData.category}
                                    options={DEPARTMENTS}
                                    onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 ml-1">Abstract</label>
                                <textarea
                                    required
                                    value={formData.abstract}
                                    onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                                    className="w-full px-6 py-4 rounded-xl bg-surface border border-border-custom focus:border-primary/50 focus:ring-4 focus:ring-teal-100 transition-all text-sm font-bold outline-none min-h-[150px] shadow-sm resize-y"
                                />
                            </div>
                        </form>

                        <div className="px-8 py-6 border-t border-border-custom bg-surface/50 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-text-dim hover:bg-card hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className={`px-10 py-4 rounded-xl bg-[#2DD4BF] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-teal-200 hover:bg-primary transition-all active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-50' : ''}`}
                            >
                                {isSaving ? 'Saving...' : <><FaSave /> Save Changes</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default EditThesisModal;
