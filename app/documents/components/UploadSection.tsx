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
            <div className="bg-white rounded-[3rem] p-4 shadow-xl border border-gray-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />

                <div
                    className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500 flex flex-col items-center justify-center text-center overflow-hidden
                        ${isDragging
                            ? 'border-red-300 bg-red-50 scale-[0.99] shadow-inner'
                            : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                        }
                        ${selectedFile ? 'border-transparent bg-white shadow-md' : ''}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {!selectedFile ? (
                        <div className="relative z-10 w-full max-w-sm mx-auto transform transition-transform duration-500 group-hover:scale-105">
                            <div className="w-24 h-24 mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-red-100">
                                    <FaCloudUploadAlt className={`text-4xl text-red-500 transition-transform duration-500 ${isDragging ? '-translate-y-2' : ''}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight uppercase">Upload Document</h3>
                            <p className="text-gray-500 text-xs font-bold leading-relaxed mb-8">
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
                                className="w-full py-4 px-8 rounded-2xl bg-[#8b0000] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow hover:bg-red-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <FaUpload className="text-[10px]" /> Select File
                            </button>
                            <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-block border border-gray-200">
                                PDF, DOCX, TXT up to 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm mx-auto text-center relative z-10">
                            <div className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-3xl flex items-center justify-center shadow-md border border-red-100">
                                <FaFileAlt className="text-4xl text-red-500" />
                            </div>
                            <h3 className="text-gray-900 font-black text-xl mb-3 uppercase tracking-tight line-clamp-1" title={selectedFile.name}>
                                {selectedFile.name}
                            </h3>
                            <div className="flex items-center justify-center gap-4 mb-10">
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                                    Ready
                                </p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <button
                                    className="p-4 rounded-2xl bg-gray-50 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all border border-gray-200"
                                    onClick={(e) => { e.stopPropagation(); onClearFile(); }}
                                    title="Cancel"
                                >
                                    <FaTimes />
                                </button>
                                <button
                                    className={`flex-1 py-4 rounded-2xl bg-[#8b0000] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow hover:bg-red-800 transition-all flex items-center justify-center gap-3 ${isUploading ? 'opacity-90 cursor-wait' : 'active:scale-95'}`}
                                    onClick={(e) => { e.stopPropagation(); onUpload(); }}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        System Online
                    </p>
                    <button
                        onClick={onOpenSubmitModal}
                        className="text-gray-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 px-5 py-3 rounded-xl transition-colors flex items-center gap-2 border border-gray-200"
                    >
                        <FaUpload className="text-[10px]" /> Submit Final Thesis
                    </button>
                </div>
            </div>
        </section>
    );
};

export default UploadSection;
