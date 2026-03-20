'use client';

import Skeleton from '../Skeleton';

export default function AdminTableSkeleton() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <Skeleton width="56px" height="56px" borderRadius="1rem" className="border border-white/10" />
                        <div className="space-y-3">
                            <Skeleton width="100px" height="10px" borderRadius="1rem" className="opacity-40" />
                            <Skeleton width="220px" height="40px" borderRadius="0.75rem" />
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Skeleton width="320px" height="56px" borderRadius="1rem" />
                        <Skeleton width="128px" height="56px" borderRadius="1rem" />
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
