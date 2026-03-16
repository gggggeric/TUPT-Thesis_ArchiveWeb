'use client';

import React from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import sandyLoading from '../../public/assets/Sandy Loading.json';
import loadingFiles from '../../public/assets/Loading Files.json';

interface LottieLoaderProps {
    type?: 'general' | 'search';
    isModal?: boolean;
    text?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({ 
    type = 'general', 
    isModal = false,
    text,
    className = '', 
    width = 'auto', 
    height = 'auto' 
}) => {
    const animationData = type === 'search' ? loadingFiles : sandyLoading;

    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div style={{ width: isModal ? 300 : width, height: isModal ? 300 : height }}>
                <Lottie 
                    animationData={animationData} 
                    loop={true} 
                    className="w-full h-full"
                />
            </div>
            {isModal && text && (
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-foreground font-black text-sm uppercase tracking-[0.3em] animate-pulse text-center px-6"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (isModal) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none backdrop-blur-md bg-black/10"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="pointer-events-auto flex flex-col items-center justify-center max-w-[90vw] mb-20"
                >
                    {content}
                </motion.div>
            </motion.div>
        );
    }

    return content;
};

export default LottieLoader;
