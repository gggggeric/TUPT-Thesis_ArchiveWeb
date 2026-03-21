'use client';

import Skeleton from '../Skeleton';

export default function AdminTableSkeleton() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Hero Title Section Skeleton */}
                <div className="mb-16 border-b border-white/5 pb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Skeleton width="120px" height="24px" borderRadius="1rem" className="opacity-20" />
                                <div className="h-px w-12 bg-white/10" />
                            </div>
                            <Skeleton width="300px" height="60px" borderRadius="1rem" />
                            <div className="space-y-2">
                                <Skeleton width="100%" height="12px" borderRadius="1rem" className="opacity-20 max-w-xl" />
                                <Skeleton width="80%" height="12px" borderRadius="1rem" className="opacity-20 max-w-md" />
                            </div>
                        </div>
                        <Skeleton width="180px" height="56px" borderRadius="1.5rem" className="opacity-10" />
                    </div>
                </div>

                {/* Quick Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex items-center justify-between">
                            <div className="space-y-3">
                                <Skeleton width="80px" height="10px" borderRadius="1rem" className="opacity-20" />
                                <Skeleton width="60px" height="32px" borderRadius="0.75rem" />
                                <Skeleton width="100px" height="8px" borderRadius="1rem" className="opacity-10" />
                            </div>
                            <Skeleton width="56px" height="56px" borderRadius="1rem" className="opacity-10" />
                        </div>
                    ))}
                </div>

                {/* Filters and Actions Skeleton */}
                <div className="flex flex-wrap items-center gap-6 mb-10">
                    <Skeleton width="400px" height="60px" borderRadius="1.5rem" className="flex-1 min-w-[300px]" />
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Skeleton width="180px" height="60px" borderRadius="1.5rem" className="opacity-40" />
                        <Skeleton width="140px" height="60px" borderRadius="1.5rem" className="opacity-40" />
                        <Skeleton width="200px" height="60px" borderRadius="1.5rem" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="h-16 px-8 flex items-center border-b border-white/10">
                        <Skeleton width="100%" height="20px" borderRadius="0.5rem" className="opacity-20" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="px-8 h-24 flex items-center border-b border-white/5 gap-6">
                            <Skeleton width="48px" height="48px" borderRadius="1rem" />
                            <div className="flex-1 space-y-2">
                                <Skeleton width="200px" height="16px" />
                                <Skeleton width="120px" height="10px" opacity-40 />
                            </div>
                            <Skeleton width="100px" height="24px" borderRadius="0.5rem" />
                            <Skeleton width="80px" height="32px" borderRadius="0.5rem" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
