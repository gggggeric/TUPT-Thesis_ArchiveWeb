'use client';

import Skeleton from '../Skeleton';

export default function AdminDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans text-white">
            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Hero Title Section Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/5 mb-12">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-3">
                            <Skeleton width="120px" height="24px" borderRadius="1rem" className="opacity-20" />
                            <div className="h-px w-12 bg-white/10" />
                        </div>
                        <Skeleton width="400px" height="60px" borderRadius="1rem" />
                        <div className="space-y-2">
                            <Skeleton width="100%" height="12px" borderRadius="1rem" className="opacity-20 max-w-xl" />
                            <Skeleton width="80%" height="12px" borderRadius="1rem" className="opacity-20 max-w-md" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <Skeleton width="160px" height="48px" borderRadius="1rem" className="opacity-10" />
                        <Skeleton width="100px" height="12px" borderRadius="1rem" className="opacity-5" />
                    </div>
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
