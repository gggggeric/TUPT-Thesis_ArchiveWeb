'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/lib/api';
import CustomHeader from '@/components/Navigation/CustomHeader';

const ForgotPassword: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [idNumber, setIdNumber] = useState<string>('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleIdInputChange = (value: string): void => {
        let formattedValue = value.replace(/[^a-zA-Z0-9]/g, '');
        formattedValue = formattedValue.toUpperCase();

        if (!formattedValue.startsWith('TUPT') && formattedValue.length > 0) {
            formattedValue = 'TUPT' + formattedValue;
        }

        if (formattedValue.length > 4) {
            formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
        }
        if (formattedValue.length > 7) {
            formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7, 11);
        }
        formattedValue = formattedValue.slice(0, 12);

        setIdNumber(formattedValue);
    };

    const validateIDNumber = (id: string): boolean => {
        const idRegex = /^TUPT-\d{2}-\d{4}$/;
        return idRegex.test(id);
    };

    const handleResetPassword = async (): Promise<void> => {
        if (!idNumber || !birthdate || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!validateIDNumber(idNumber)) {
            toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber,
                    birthdate,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Password reset successful!');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error(data.message || 'Reset failed. Please check your details.');
            }
        } catch (error) {
            console.error('Reset error:', error);
            toast.error('Cannot connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (): void => {
        setIdNumber('');
        setBirthdate('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleResetPassword();
        }
    };

    const inputInnerClasses = "w-full h-10 bg-white border border-gray-300 px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500";
    const labelClasses = "text-[13px] font-bold text-[#fecaca]";

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#8b0000]/[0.05] rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#8b0000]/[0.05] rounded-full blur-3xl animate-pulse-slow" />

                <div className="w-full max-w-lg bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-black/40 border border-white/10 overflow-hidden relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="p-8 md:p-12 pb-6 relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <FaKey className="text-white text-lg" />
                            </div>
                            <h3 className="text-white text-base font-black uppercase tracking-[0.2em]">Reset Password</h3>
                        </div>
                        <div className="h-px bg-white/10 w-full mb-10" />

                        <div className="space-y-5">
                            {/* ID Number Field */}
                            <div className="space-y-1">
                                <label className={labelClasses}>ID Number:</label>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-white/5 border border-white/20 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all font-bold"
                                    placeholder="TUPT-XX-XXXX"
                                    value={idNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleIdInputChange(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    maxLength={12}
                                />
                            </div>

                            {/* Birthdate Field */}
                            <div className="space-y-1">
                                <label className={labelClasses}>Birthdate:</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-white/5 border border-white/20 px-4 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all font-bold [color-scheme:dark]"
                                    value={birthdate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthdate(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                                />
                            </div>

                            {/* New Password Field */}
                            <div className="space-y-1">
                                <label className={labelClasses}>New Password:</label>
                                <input
                                    type="password"
                                    className="w-full h-12 bg-white/5 border border-white/20 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all font-bold"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-1">
                                <label className={labelClasses}>Repeat Password:</label>
                                <input
                                    type="password"
                                    className="w-full h-12 bg-white/5 border border-white/20 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all font-bold"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 pb-6">
                                <button
                                    onClick={handleClear}
                                    className="bg-transparent text-white/60 text-[11px] font-bold px-4 py-2 border-2 border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleResetPassword}
                                    disabled={isLoading}
                                    className="bg-white text-[#8b0000] text-[11px] font-black px-8 py-2 border-2 border-white rounded-lg hover:bg-[#fecaca] transition-all flex items-center gap-2"
                                >
                                    {isLoading ? 'Wait...' : 'Reset'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <p className="text-white/60 text-sm font-medium">
                        Remembered your password?{' '}
                        <Link href="/login" className="text-white font-bold hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
