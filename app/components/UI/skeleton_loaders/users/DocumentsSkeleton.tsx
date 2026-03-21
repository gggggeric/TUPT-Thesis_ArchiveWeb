'use client';

import React from 'react';
import Skeleton from '../Skeleton';

const DocumentsSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col min-h-full animate-fade-in">
            <main className="relative z-10 flex-1 pt-32 pb-16">
                {/* Documents Hero Skeleton */}
                <div className="max-w-[1700px] mx-auto px-6 mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-16">
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center gap-3">
                                <Skeleton width="120px" height="20px" borderRadius="1rem" className="opacity-20" />
                                <div className="h-px w-12 bg-white/10" />
                            </div>
                            <Skeleton width="400px" height="64px" borderRadius="1.5rem" />
                            <div className="space-y-3">
                                <Skeleton width="100%" height="14px" borderRadius="1rem" className="opacity-20 max-w-2xl" />
                                <Skeleton width="80%" height="14px" borderRadius="1rem" className="opacity-20 max-w-lg" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Skeleton width="160px" height="48px" borderRadius="1rem" className="opacity-10" />
                            <Skeleton width="160px" height="48px" borderRadius="1rem" className="opacity-10" />
                        </div>
                    </div>
                </div>

                <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10 px-6">
                    <div className="space-y-12">
                        {/* Upload Section Skeleton */}
                        <div className="bg-[#1E1E2E]/40 backdrop-blur-xl rounded-[3rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden h-[450px] flex flex-col items-center justify-center">
                            <Skeleton width="100px" height="100px" borderRadius="2rem" className="mb-8 opacity-10" />
                            <Skeleton width="300px" height="32px" className="mb-4" />
                            <Skeleton width="200px" height="14px" className="mb-12 opacity-40" />
                            <div className="flex gap-6 w-full max-w-md">
                                <Skeleton width="50%" height="56px" borderRadius="1.5rem" />
                                <Skeleton width="50%" height="56px" borderRadius="1.5rem" className="opacity-40" />
                            </div>
                        </div>

                        {/* How It Works Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-4">
                                    <Skeleton width="48px" height="48px" borderRadius="1rem" className="opacity-20" />
                                    <Skeleton width="140px" height="24px" />
                                    <Skeleton width="100%" height="12px" className="opacity-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Drafts Sidebar Skeleton */}
                    <div className="lg:border-l lg:border-white/10 lg:pl-10 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <Skeleton width="120px" height="20px" />
                            <Skeleton width="80px" height="14px" />
                        </div>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-4">
                                <Skeleton width="48px" height="48px" borderRadius="1rem" className="shrink-0 opacity-10" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton width="80%" height="16px" />
                                    <Skeleton width="40%" height="10px" className="opacity-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DocumentsSkeleton;
