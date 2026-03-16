'use client';

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';

import DocumentsHero from './components/DocumentsHero';
import UploadSection from './components/UploadSection';
import HowItWorks from './components/HowItWorks';
import AnalysisWorkspace, { AnalysisResult } from './components/AnalysisWorkspace';
import DraftsList from './components/DraftsList';

const DocumentsPage: React.FC = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [mounted, setMounted] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/analysis-drafts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDrafts(data.data || []);
            }
        } catch (err) {
            console.error('Fetch drafts error:', err);
        }
    };

    const handleResumeDraft = (draft: any) => {
        // Construct a pseudo-file object for the workspace
        const mockFile = { name: draft.fileName } as File;
        
        const resumedResult: AnalysisResult = {
            ...draft.originalResults,
            pagesText: draft.localPagesText,
            appliedIssueIds: draft.appliedIssueIds
        };

        setSelectedFile(mockFile);
        setAnalysisResult(resumedResult);
        toast.success(`Resumed analysis for ${draft.fileName}`);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedTypes.includes(file.type)) {
            setSelectedFile(file);
            setAnalysisResult(null); // Reset previous analysis
        } else {
            toast.error('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        const startTime = Date.now();
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('thesis', selectedFile);

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            // Ensure minimum 3s delay
            const elapsed = Date.now() - startTime;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }

            if (response.ok) {
                // If the backend already returns categories, use them directly
                // Otherwise fallback to the local grouping logic
                const categories = data.categories || [];
                const wordCount = data.statistics?.wordCount || 0;
                const sentenceCount = data.statistics?.sentenceCount || 0;
                const paragraphCount = data.statistics?.paragraphCount || 0;

                const mapped: AnalysisResult = {
                    overallScore: data.overallScore,
                    totalIssues: data.totalIssues || (data.recommendations || []).length,
                    statistics: {
                        wordCount,
                        sentenceCount,
                        paragraphCount,
                        readabilityIndex: data.statistics?.readabilityIndex || 0
                    },
                    categories,
                    pagesText: data.pagesText || [],
                };

                setAnalysisResult(mapped);
                toast.success('Analysis complete!');
            } else {
                toast.error(data.error || data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Upload error:', error);

            // Even on error, ensure minimum delay if needed
            const elapsed = Date.now() - startTime;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }

            // Re-throw demo error context in case the server fails
            toast.info('Could not analyze file (server error)');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-foreground selection:bg-[#2DD4BF] selection:text-white">
            <CustomHeader onMenuPress={() => setMenuVisible(!menuVisible)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#2DD4BF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-[#2DD4BF]/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 pt-16 pb-16">
                {!analysisResult ? (
                    <>
                        <DocumentsHero />

                        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10 px-6">
                            <div className="space-y-12">
                                <UploadSection
                                    isDragging={isDragging}
                                    selectedFile={selectedFile}
                                    isUploading={isUploading}
                                    fileInputRef={fileInputRef}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onFileSelect={handleFileSelect}
                                    onClearFile={() => setSelectedFile(null)}
                                    onUpload={handleUpload}
                                    onOpenSubmitModal={() => router.push('/documents/create')}
                                />
                                <HowItWorks />
                            </div>

                            <div className="lg:border-l lg:border-white/10 lg:pl-10">
                                <DraftsList drafts={drafts} onResume={handleResumeDraft} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="pt-8">
                        <AnalysisWorkspace
                            result={analysisResult}
                            file={selectedFile}
                            onClose={() => setAnalysisResult(null)}
                        />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default DocumentsPage;
