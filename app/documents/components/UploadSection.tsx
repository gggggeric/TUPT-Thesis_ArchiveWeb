import React from 'react';
import { FaCloudUploadAlt, FaFileAlt, FaTimes, FaSearch, FaUpload } from 'react-icons/fa';

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
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-4 shadow-2xl shadow-black/20 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

                <div
                    className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
                        ${isDragging
                            ? 'border-white/40 bg-white/10 scale-[0.99] shadow-inner'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                        }
                        ${selectedFile ? 'border-transparent bg-gradient-to-br from-[#8b0000] to-[#500000]' : ''}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {!selectedFile ? (
                        <div className="relative z-10 w-full max-w-sm mx-auto transform transition-transform duration-500 group-hover:scale-105">
                            <div className="w-24 h-24 mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-full h-full bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl shadow-black/20 border border-white/20">
                                    <FaCloudUploadAlt className={`text-4xl text-white transition-transform duration-500 ${isDragging ? '-translate-y-2' : ''}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight uppercase">Upload Document</h3>
                            <p className="text-white/40 text-xs font-bold leading-relaxed mb-8">
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
                                className="w-full py-4 px-8 rounded-2xl bg-white text-[#8b0000] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg border border-white/20 hover:bg-[#fecaca] transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                            >
                                <FaUpload className="text-[10px]" /> Select File
                            </button>
                            <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-[#fecaca] bg-white/5 py-2 px-4 rounded-full inline-block border border-white/10">
                                PDF, DOCX, TXT up to 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto text-center relative z-10">
                            <div className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                                <FaFileAlt className="text-4xl text-white" />
                            </div>
                            <h3 className="text-white font-black text-xl mb-3 uppercase tracking-tight line-clamp-1" title={selectedFile.name}>
                                {selectedFile.name}
                            </h3>
                            <div className="flex items-center justify-center gap-4 mb-10">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                                    Ready
                                </p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <button
                                    className="p-4 rounded-2xl bg-black/20 text-white/60 hover:text-white hover:bg-black/40 transition-all border border-white/10 backdrop-blur-sm"
                                    onClick={(e) => { e.stopPropagation(); onClearFile(); }}
                                    title="Cancel"
                                >
                                    <FaTimes />
                                </button>
                                <button
                                    className={`flex-1 py-4 rounded-2xl bg-white text-[#8b0000] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 ${isUploading ? 'opacity-90 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}
                                    onClick={(e) => { e.stopPropagation(); onUpload(); }}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-[#8b0000]/20 border-t-[#8b0000] rounded-full animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <FaSearch className="text-[10px]" /> Run Analysis
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 px-4 pb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        System Online
                    </p>
                    <button
                        onClick={onOpenSubmitModal}
                        className="text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 px-5 py-3 rounded-xl transition-colors flex items-center gap-2 border border-white/10"
                    >
                        <FaUpload className="text-[10px]" /> Submit Final Thesis
                    </button>
                </div>
            </div>
        </section>
    );
};

export default UploadSection;
