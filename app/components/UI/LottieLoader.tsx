'use client';

import React from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import sandyLoading from '../../../public/assets/Sandy Loading.json';
import loadingFiles from '../../../public/assets/Loading Files.json';
import aiThinking from '../../../public/assets/Ai Loading Thinking.json';
import mappingML from '../../../public/assets/Mapping for machine learning.json';
import workspaceRobot from '../../../public/assets/Man and robot with computers sitting together in workplace.json';

interface LottieLoaderProps {
    type?: 'general' | 'search' | 'ai' | 'login' | 'workspace';
    isModal?: boolean;
    text?: string;
    subtext?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
}

const LottieLoader: React.FC<LottieLoaderProps> = ({
    type = 'general',
    isModal = false,
    text,
    subtext,
    className = '',
    width = 'auto',
    height = 'auto'
}) => {
    const animationData = type === 'search' ? loadingFiles : type === 'ai' ? aiThinking : type === 'login' ? mappingML : type === 'workspace' ? workspaceRobot : sandyLoading;

    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div style={{ width: isModal ? 300 : width, height: isModal ? 300 : height }}>
                <Lottie
                    animationData={animationData}
                    loop={true}
                    className="w-full h-full"
                />
            </div>
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${isModal ? 'text-white' : 'text-foreground'} font-black text-sm uppercase tracking-[0.3em] ${isModal ? '' : 'animate-pulse'} text-center px-6 mt-4`}
                >
                    {text}
                </motion.p>
            )}
            {subtext && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${isModal ? 'text-white/60' : 'text-gray-500'} text-[10px] uppercase tracking-widest text-center px-6 mt-2`}
                >
                    {subtext}
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
