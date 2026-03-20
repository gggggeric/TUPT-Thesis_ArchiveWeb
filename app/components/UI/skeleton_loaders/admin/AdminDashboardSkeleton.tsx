'use client';

import Skeleton from '../Skeleton';

export default function AdminDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <Skeleton width="56px" height="56px" borderRadius="1rem" className="border border-white/10" />
                        <div className="space-y-3">
                            <Skeleton width="100px" height="10px" borderRadius="1rem" className="opacity-40" />
                            <Skeleton width="200px" height="40px" borderRadius="0.75rem" />
                        </div>
                    </div>
                    <Skeleton width="250px" height="48px" borderRadius="1rem" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <Skeleton width="100%" height="100%" borderRadius="1rem" />
                        </div>
                    ))}
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <Skeleton width="100%" height="100%" borderRadius="1rem" />
                    </div>
                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <Skeleton width="100%" height="100%" borderRadius="1rem" />
                    </div>
                </div>
            </main>
        </div>
    );
}
