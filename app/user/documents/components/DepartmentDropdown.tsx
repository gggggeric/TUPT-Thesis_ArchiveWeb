'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface DepartmentDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-8 py-5 rounded-2xl bg-surface border transition-all text-sm font-medium outline-none shadow-sm flex items-center justify-between ${
                    isOpen ? 'border-primary/50 ring-4 ring-teal-100' : 'border-border-custom'
                }`}
            >
                <span className={value ? 'text-foreground font-bold' : 'text-gray-400'}>
                    {value || 'Select Department'}
                </span>
                <FaChevronDown className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''} text-primary`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] w-full mt-3 bg-card border border-border-custom rounded-[1.5rem] shadow-2xl overflow-hidden origin-top"
                    >
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                                        value === option 
                                        ? 'bg-teal-50 text-[#2DD4BF]' 
                                        : 'text-text-dim hover:bg-surface hover:text-foreground'
                                    }`}
                                >
                                    {option}
                                    {value === option && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" 
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #f3f4f6;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                }
            `}</style>
        </div>
    );
};


export default DepartmentDropdown;
