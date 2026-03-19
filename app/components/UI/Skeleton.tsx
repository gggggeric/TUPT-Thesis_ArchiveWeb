'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    borderRadius,
    circle = false
}) => {
    const style: React.CSSProperties = {
        width: width,
        height: height,
        borderRadius: circle ? '50%' : borderRadius || '0.5rem',
    };

    return (
        <div 
            className={`skeleton-base ${className}`}
            style={style}
        >
            <style jsx>{`
                .skeleton-base {
                    background: #1e293b; /* base color for dark theme */
                    background: linear-gradient(
                        90deg, 
                        #1e293b 25%, 
                        #334155 50%, 
                        #1e293b 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    position: relative;
                    overflow: hidden;
                    opacity: 0.6;
                }

                @keyframes shimmer {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Skeleton;
