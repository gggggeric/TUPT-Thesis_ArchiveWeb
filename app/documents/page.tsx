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
import AnalysisWorkspace, { AnalysisResult } from './components/AnalysisWorkspace';

const DocumentsPage: React.FC = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

            if (response.ok) {
                const categoryColors: Record<string, string> = {
                    'Structure': '#f59e0b',       // Amber
                    'Writing Style': '#8b5cf6',   // Purple
                    'Academic Style': '#3b82f6',  // Blue
                    'Grammar & Style': '#ec4899', // Pink
                };

                // Group the raw recommendations into our categorized structure
                const grouped: Record<string, any[]> = {};
                (data.recommendations || []).forEach((rec: any) => {
                    if (!grouped[rec.category]) grouped[rec.category] = [];
                    grouped[rec.category].push({
                        title: rec.title,
                        description: rec.description,
                        suggestion: rec.suggestion,
                        severity: rec.severity,
                        pages: rec.pages
                    });
                });

                const categories = Object.entries(grouped).map(([name, issues]) => ({
                    name,
                    color: categoryColors[name] || '#3f2b2b',
                    issues,
                }));

                const totalIssues = (data.recommendations || []).length;

                const mapped: AnalysisResult = {
                    overallScore: data.overallScore,
                    totalIssues,
                    wordCount: data.statistics?.wordCount,
                    sentenceCount: data.statistics?.sentenceCount,
                    paragraphCount: data.statistics?.paragraphCount,
                    categories,
                    pagesText: data.pagesText,
                };

                setAnalysisResult(mapped);
                toast.success('Analysis complete!');
            } else {
                toast.error(data.error || data.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Upload error:', error);

            // Re-throw demo error context in case the server fails
            toast.info('Could not analyze file (server error)');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900 selection:bg-[#8b0000] selection:text-white">
            <CustomHeader onMenuPress={() => setMenuVisible(!menuVisible)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            {mounted && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#8b0000]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-[#8b0000]/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4 animate-pulse-slow" />
                </div>
            )}

            <main className="relative z-10 flex-1 pt-16 pb-16">
                {!analysisResult ? (
                    <>
                        <DocumentsHero />

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
