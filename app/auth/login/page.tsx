'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API_BASE_URL from '@/app/lib/api';
import CustomHeader from '@/app/components/Navigation/CustomHeader';
import LottieLoader from '@/app/components/UI/LottieLoader';

const Login: React.FC = () => {
    const router = useRouter();
    const [idNumber, setIdNumber] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [birthdate, setBirthdate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (value: string): void => {
        const val = value.toUpperCase();
        // If deleting, don't re-format aggressively to allow backspacing
        if (val.length < idNumber.length) {
            setIdNumber(val);
            return;
        }

        let clean = val.replace(/[^A-Z0-9]/g, '');
        if (clean.length > 0 && !clean.startsWith('TUPT')) {
            if (!'TUPT'.startsWith(clean)) {
                clean = 'TUPT' + clean;
            }
        }

        let result = clean;
        if (clean.length > 4) {
            result = clean.slice(0, 4) + '-' + clean.slice(4);
        }
        if (result.length > 7) {
            result = result.slice(0, 7) + '-' + result.slice(7, 11);
        }
        setIdNumber(result.slice(0, 12));
    };

    const validateIDNumber = (id: string): boolean => {
        const idRegex = /^TUPT-\d{2}-\d{4}$/;
        return idRegex.test(id);
    };

    const handleLogin = async (): Promise<void> => {
        if (!idNumber || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!validateIDNumber(idNumber)) {
            toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
            return;
        }

        const startTime = Date.now();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber: idNumber,
                    password: password
                }),
            });

            const data = await response.json();

            // Ensure minimum 3s delay
            const elapsed = Date.now() - startTime;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }

            if (response.ok) {
                const userData = data.user;

                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(userData));
                toast.success(data.message || 'Logged in successfully!');

                if (data.user.isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/home');
                }
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Even on error, ensure minimum delay if needed
            const elapsed = Date.now() - startTime;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }
            toast.error('Cannot connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (): void => {
        setIdNumber('');
        setPassword('');
        setBirthdate('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
                <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border-custom overflow-hidden relative z-10">
                    <div className="p-4 md:p-8 pb-2">
                        <h3 className="text-foreground text-sm font-bold mb-2 uppercase tracking-widest">Sign In</h3>
                        <div className="h-[1px] bg-border-custom w-full mb-6" />

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-dim">ID Number:</label>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-surface border border-border-custom px-4 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold"
                                    placeholder="TUPT-XX-XXXX"
                                    value={idNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    maxLength={12}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-dim">Password:</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full h-12 bg-surface border border-border-custom px-4 pr-12 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        suppressHydrationWarning={true}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-text-dim">Birthdate:</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-surface border border-border-custom px-4 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold"
                                    value={birthdate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthdate(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 pb-4">
                                <button
                                    onClick={handleClear}
                                    className="bg-card text-text-dim text-[11px] font-bold px-4 py-2 border-2 border-border-custom rounded-lg hover:bg-surface hover:text-foreground transition-colors"
                                >
                                    Clear
                                </button>

                                {isLoading && <LottieLoader isModal type="login" text="Signing in..." />}

                                <button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="bg-primary/5 border border-primary/30 text-primary font-black text-[11px] uppercase tracking-[0.2em] px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] active:scale-95 active:bg-primary/30"
                                >
                                    Sign In
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-border-custom pt-6">
                                <p className="text-text-dim text-[13px] font-medium mb-3">
                                    Don't have an account?{' '}
                                    <Link href="/auth/register" className="text-teal-700 font-black hover:underline underline-offset-4 decoration-2">
                                        Register here
                                    </Link>
                                </p>
                                <Link href="/auth/forgot-password" title="Forgot Password" className="text-gray-400 text-[11px] font-bold hover:text-text-dim transition-colors uppercase tracking-widest">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
