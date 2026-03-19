'use client';

import React from 'react';
import Skeleton from './Skeleton';

const ThesisDetailSkeleton = () => {
    return (
        <div className="max-w-3xl mx-auto animate-fade-in pb-16">
            <div className="relative">
                {/* Paper decorative backgrounds */}
                <div className="absolute inset-0 bg-stone-200/40 rounded-3xl translate-y-6 translate-x-3 -rotate-2" />
                <div className="absolute inset-0 bg-stone-200/60 rounded-3xl translate-y-3 translate-x-1.5 rotate-1" />

                <div className="relative bg-[#fafaf8] rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.4)] min-h-[900px] flex flex-col p-8 md:p-14 border border-stone-200">
                    {/* Header Seal */}
                    <div className="flex flex-col items-center text-center pb-8 mb-10 border-b border-stone-200">
                        <Skeleton width="64px" height="64px" circle className="mb-4" />
                        <Skeleton width="300px" height="16px" className="mb-2" />
                        <Skeleton width="200px" height="12px" className="mb-4" />
                        <Skeleton width="400px" height="10px" />
                    </div>

                    {/* Content */}
                    <div className="px-4">
                        <div className="flex justify-between items-start mb-14">
                            <div className="space-y-2">
                                <Skeleton width="80px" height="10px" />
                                <Skeleton width="100px" height="14px" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <Skeleton width="100px" height="10px" />
                                <Skeleton width="80px" height="14px" />
                            </div>
                        </div>

                        <div className="text-center mb-14">
                            <Skeleton width="100%" height="32px" className="mb-4" />
                            <Skeleton width="80%" height="32px" className="mx-auto mb-8" />
                            <div className="flex items-center justify-center gap-4">
                                <Skeleton width="40px" height="2px" />
                                <Skeleton width="60px" height="14px" />
                                <Skeleton width="40px" height="2px" />
                            </div>
                        </div>

                        <div className="mb-14 text-center">
                            <Skeleton width="100px" height="12px" className="mx-auto mb-8" />
                            <Skeleton width="250px" height="24px" className="mx-auto mb-2" />
                            <Skeleton width="180px" height="10px" className="mx-auto" />
                        </div>

                        <div className="space-y-4">
                            <Skeleton width="100px" height="12px" className="mb-8" />
                            <Skeleton width="100%" height="20px" />
                            <Skeleton width="100%" height="20px" />
                            <Skeleton width="100%" height="20px" />
                            <Skeleton width="100%" height="20px" />
                            <Skeleton width="90%" height="20px" />
                            <Skeleton width="100%" height="20px" />
                            <Skeleton width="85%" height="20px" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThesisDetailSkeleton;
