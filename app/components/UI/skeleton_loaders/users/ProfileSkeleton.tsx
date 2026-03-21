'use client';

import React from 'react';
import Skeleton from '../Skeleton';

const ProfileSkeleton = () => {
    return (
        <div className="flex-1 relative z-10 py-32 px-6 animate-fade-in">
            <main className="max-w-4xl mx-auto space-y-12 relative z-10">
                {/* Back Button Skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <Skeleton width="120px" height="14px" borderRadius="1rem" className="opacity-40" />
                </div>

                {/* Hero Profile Section Skeleton */}
                <div className="bg-[#1E1E2E]/60 backdrop-blur-xl rounded-[3rem] p-12 border border-white/5 shadow-xl overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <Skeleton width="160px" height="160px" borderRadius="2.5rem" className="border-4 border-white/5 opacity-10" />
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#1E1E2E] rounded-2xl border border-white/10" />
                        </div>
                        <div className="text-center md:text-left space-y-4">
                            <Skeleton width="280px" height="40px" borderRadius="0.75rem" />
                            <div className="flex gap-3 justify-center md:justify-start">
                                <Skeleton width="100px" height="28px" borderRadius="1rem" className="opacity-20" />
                                <Skeleton width="120px" height="28px" borderRadius="1rem" className="opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Skeleton */}
                <div className="bg-[#1E1E2E]/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-12">
                        <Skeleton width="180px" height="20px" borderRadius="1rem" className="opacity-20" />
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton width="120px" height="10px" className="opacity-20 uppercase tracking-widest" />
                                <Skeleton width="220px" height="28px" borderRadius="0.75rem" />
                                <div className="w-8 h-0.5 bg-white/5" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Footer Skeleton */}
                <div className="bg-white/5 p-8 border border-white/5 flex justify-center rounded-[2.5rem]">
                    <Skeleton width="250px" height="56px" borderRadius="1.5rem" />
                </div>
            </main>
        </div>
    );
};

export default ProfileSkeleton;
