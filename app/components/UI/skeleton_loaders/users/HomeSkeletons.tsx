'use client';

import Skeleton from '../Skeleton';

export const StatCardSkeleton = () => (
  <div className="bg-card rounded-2xl p-7 shadow-lg border border-border-custom flex items-center justify-between animate-pulse">
    <div className="space-y-3">
      <div className="w-20 h-3 bg-white/5 rounded-full" />
      <div className="w-12 h-8 bg-white/10 rounded-lg" />
      <div className="w-24 h-2.5 bg-white/5 rounded-full" />
    </div>
    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10" />
  </div>
);

export const HistoryItemSkeleton = () => (
  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
    <div className="flex-1 min-w-0 flex items-center gap-6">
      <div className="w-11 h-11 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 bg-white/10 rounded-md" />
        <div className="w-1/4 h-2.5 bg-white/5 rounded-md" />
      </div>
    </div>
    <div className="w-10 h-10 bg-white/5 rounded-xl" />
  </div>
);

export const CategoryItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 animate-pulse">
    <div className="w-1/3 h-4 bg-white/10 rounded-md" />
    <div className="w-8 h-4 bg-white/5 rounded-md" />
  </div>
);

const HomeSkeletons = () => {
    return (
        <div className="w-full space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            
            <div className="space-y-6">
                <div className="h-4 w-32 bg-white/5 rounded-full mb-4" />
                <div className="bg-card rounded-2xl border border-border-custom shadow-xl overflow-hidden divide-y divide-white/[0.03]">
                    {[1, 2, 3, 4, 5].map(i => (
                        <HistoryItemSkeleton key={i} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-white/5 rounded-full" />
                    <div className="bg-card rounded-2xl p-7 border border-border-custom h-[200px] flex flex-col justify-center space-y-4">
                        <div className="h-2 w-full bg-white/5 rounded-full" />
                        <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-white/5 rounded-full" />
                    <div className="bg-card rounded-2xl border border-border-custom p-4 divide-y divide-white/[0.03]">
                        {[1, 2, 3, 4, 5].map(i => (
                            <CategoryItemSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeSkeletons;
