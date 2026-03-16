import React from 'react';
import { FaCloudUploadAlt, FaFileAlt, FaTimes, FaSearch, FaUpload } from 'react-icons/fa';
import LottieLoader from '@/components/UI/LottieLoader';

interface UploadSectionProps {
    isDragging: boolean;
    selectedFile: File | null;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFile: () => void;
    onUpload: () => void;
    onOpenSubmitModal: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
    isDragging,
    selectedFile,
    isUploading,
    fileInputRef,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
    onClearFile,
    onUpload,
    onOpenSubmitModal
}) => {
    return (
        <section className="max-w-4xl mx-auto px-6 mb-12 relative z-10 animate-slide-up">
            <div className="backdrop-blur-xl bg-card/30 rounded-[3rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />

                <div
                    className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
                        ${isDragging
                            ? 'border-primary/50 bg-teal-50 scale-[0.99] shadow-inner'
                            : 'border-border-custom hover:border-primary/30 hover:bg-surface'
                        }
                        ${selectedFile ? 'border-transparent bg-card shadow-md' : ''}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {!selectedFile ? (
                        <div className="relative z-10 w-full max-w-sm mx-auto transform transition-transform duration-500 group-hover:scale-105">
                            <div className="w-24 h-24 mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-full h-full bg-card rounded-full flex items-center justify-center shadow-lg border border-teal-100">
                                    <FaCloudUploadAlt className={`text-4xl text-primary transition-transform duration-500 ${isDragging ? '-translate-y-2' : ''}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-3 tracking-tight uppercase">Upload Document</h3>
                            <p className="text-text-dim text-xs font-bold leading-relaxed mb-8">
                                Drag and drop your file here, or click to browse local files.
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileSelect}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 px-8 rounded-2xl bg-primary/5 border border-primary/30 text-primary font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 active:scale-95 active:bg-primary/30 flex items-center justify-center gap-3"
                            >
                                <FaUpload className="text-[10px]" /> Select File
                            </button>
                            <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-text-dim bg-surface py-2 px-4 rounded-full inline-block border border-border-custom">
                                PDF, DOCX, TXT up to 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto text-center relative z-10">
                            <div className="w-24 h-24 mx-auto mb-8 bg-teal-50 rounded-3xl flex items-center justify-center shadow-md border border-teal-100">
                                <FaFileAlt className="text-4xl text-primary" />
                            </div>
                            <h3 className="text-foreground font-black text-xl mb-3 uppercase tracking-tight line-clamp-1" title={selectedFile.name}>
                                {selectedFile.name}
                            </h3>
                            <div className="flex items-center justify-center gap-4 mb-10">
                                <p className="text-text-dim text-[10px] font-black uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-border-custom">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-text-dim text-[10px] font-black uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-border-custom">
                                    Ready
                                </p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <button
                                    className="p-4 rounded-2xl bg-surface text-text-dim hover:text-foreground hover:bg-gray-100 transition-all border border-border-custom"
                                    onClick={(e) => { e.stopPropagation(); onClearFile(); }}
                                    title="Cancel"
                                >
                                    <FaTimes />
                                </button>
                                {isUploading && <LottieLoader isModal type="search" text="Analyzing Thesis..." />}

                                <button
                                    className={`flex-1 py-4 rounded-2xl bg-primary/5 border border-primary/30 text-primary font-black text-[11px] uppercase tracking-[0.3em] shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300 flex items-center justify-center gap-3 active:bg-primary/30 ${isUploading ? 'opacity-90 cursor-wait' : 'active:scale-95'}`}
                                    onClick={(e) => { e.stopPropagation(); onUpload(); }}
                                    disabled={isUploading}
                                >
                                    <FaSearch className="text-[10px]" /> Run Analysis
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 px-4 pb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-text-dim text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-card/400 animate-pulse" />
                        System Online
                    </p>
                    <button
                        onClick={onOpenSubmitModal}
                        className="text-text-dim font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface px-5 py-3 rounded-xl transition-colors flex items-center gap-2 border border-border-custom"
                    >
                        <FaUpload className="text-[10px]" /> Submit Final Thesis
                    </button>
                </div>
            </div>
        </section>
    );
};

export default UploadSection;
