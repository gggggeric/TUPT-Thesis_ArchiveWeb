'use client';

import React from 'react';
import Skeleton from './Skeleton';

const SearchResultSkeleton = () => {
    return (
        <div className="w-full animate-fade-in">
            {/* Header Navigation Skeleton */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Skeleton width="150px" height="20px" />
                <div className="flex flex-wrap gap-3">
                    <Skeleton width="120px" height="32px" borderRadius="0.5rem" />
                    <Skeleton width="150px" height="32px" borderRadius="0.5rem" />
                </div>
            </div>

            {/* AI Recommendation Card Skeleton */}
            <div className="mb-8 bg-card rounded-2xl shadow-xl border border-border-custom overflow-hidden p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Skeleton width="40px" height="40px" borderRadius="0.75rem" />
                        <div>
                            <Skeleton width="200px" height="24px" className="mb-2" />
                            <Skeleton width="150px" height="14px" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton width="120px" height="40px" borderRadius="0.75rem" />
                        <Skeleton width="140px" height="40px" borderRadius="0.75rem" />
                    </div>
                </div>
            </div>

            {/* Archive Distribution Chart Skeleton */}
            <div className="mb-12 bg-[#0f172a]/30 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Skeleton width="48px" height="48px" borderRadius="1rem" />
                        <div>
                            <Skeleton width="120px" height="12px" className="mb-2" />
                            <Skeleton width="180px" height="28px" />
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-col items-end">
                            <Skeleton width="40px" height="10px" className="mb-2" />
                            <Skeleton width="60px" height="32px" />
                        </div>
                        <div className="flex flex-col items-end">
                            <Skeleton width="60px" height="10px" className="mb-2" />
                            <Skeleton width="80px" height="32px" />
                        </div>
                    </div>
                </div>
                <Skeleton width="100%" height="220px" borderRadius="1rem" />
            </div>

            {/* Results Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-2xl shadow-xl border border-border-custom flex flex-col h-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton width="80px" height="24px" borderRadius="0.5rem" />
                            <Skeleton width="24px" height="24px" circle />
                        </div>
                        <Skeleton width="100%" height="24px" className="mb-3" />
                        <Skeleton width="90%" height="24px" className="mb-4" />
                        <div className="space-y-2 mb-6">
                            <Skeleton width="100%" height="14px" />
                            <Skeleton width="100%" height="14px" />
                            <Skeleton width="70%" height="14px" />
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <Skeleton width="60px" height="14px" />
                            <Skeleton width="100px" height="36px" borderRadius="0.75rem" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResultSkeleton;
