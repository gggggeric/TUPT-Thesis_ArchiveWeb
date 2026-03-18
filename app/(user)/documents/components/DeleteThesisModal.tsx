'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface DeleteThesisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    thesisTitle: string;
}

const DeleteThesisModal: React.FC<DeleteThesisModalProps> = ({ isOpen, onClose, onConfirm, thesisTitle }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#1E293B] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {/* Icon Wrapper */}
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-500/5">
                                <FaExclamationTriangle className="text-3xl text-red-500" />
                            </div>

                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Confirm Deletion</h3>
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6 px-4 leading-relaxed">
                                Are you sure you want to delete <span className="text-red-400">"{thesisTitle}"</span>? This action is permanent and cannot be undone.
                            </p>

                            <div className="flex flex-col w-full gap-3 mt-4">
                                <button
                                    onClick={onConfirm}
                                    className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <FaTrash className="text-[12px]" />
                                    Delete Permanently
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteThesisModal;
