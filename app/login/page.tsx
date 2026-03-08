'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/lib/api';
import CustomHeader from '@/components/Navigation/CustomHeader';

const Login: React.FC = () => {
    const router = useRouter();
    const [idNumber, setIdNumber] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (value: string): void => {
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

    const handleLogin = async (): Promise<void> => {
        if (!idNumber || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!validateIDNumber(idNumber)) {
            toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX');
            return;
        }

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

            if (response.ok) {
                const userData = {
                    _id: data.user._id,
                    name: data.user.name,
                    idNumber: data.user.idNumber,
                    birthdate: data.user.birthdate,
                    age: data.user.age,
                    createdAt: data.user.createdAt,
                    isAdmin: data.user.isAdmin,
                };

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
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 bg-gradient-to-br from-[#8b0000] via-[#fecaca] to-white relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#8b0000]/[0.05] rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#8b0000]/[0.05] rounded-full blur-3xl animate-pulse-slow" />

                <div className="w-full max-w-lg bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-4 border-[#8b0000]/20 overflow-hidden relative z-10">
                    <div className="p-4 md:p-8 pb-2">
                        <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-widest">Sign In</h3>
                        <div className="h-[1px] bg-white/40 w-full mb-6" />

                        <div className="space-y-5">
                            {/* Username/ID Field */}
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-[#fecaca]">ID Number:</label>
                                <input
                                    type="text"
                                    className="w-full h-10 bg-white border border-gray-300 px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="TUPT-XX-XXXX"
                                    value={idNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    maxLength={12}
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-[#fecaca]">Password:</label>
                                <input
                                    type="password"
                                    className="w-full h-10 bg-white border border-gray-300 px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>

                            {/* Birthdate Field */}
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-[#fecaca]">Birthdate:</label>
                                <input
                                    type="date"
                                    className="w-full h-10 bg-white border border-gray-300 px-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={birthdate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBirthdate(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 pb-4">
                                <button
                                    onClick={handleClear}
                                    className="bg-transparent text-white/60 text-[11px] font-bold px-4 py-2 border-2 border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="bg-white text-[#8b0000] text-[11px] font-black px-8 py-2 border-2 border-white rounded-lg hover:bg-[#fecaca] transition-all flex items-center gap-2 shadow-lg"
                                >
                                    {isLoading ? 'Wait...' : 'Sign In'}
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-white/10 pt-6">
                                <p className="text-white/80 text-[13px] font-medium mb-3">
                                    Don't have an account?{' '}
                                    <Link href="/register" className="text-white font-black hover:underline underline-offset-4 decoration-2">
                                        Register here
                                    </Link>
                                </p>
                                <Link href="/forgot-password" title="Forgot Password" className="text-white/40 text-[11px] font-bold hover:text-white transition-colors uppercase tracking-widest">
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
