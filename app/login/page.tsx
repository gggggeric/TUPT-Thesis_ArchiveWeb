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
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10">
                    <div className="p-4 md:p-8 pb-2">
                        <h3 className="text-gray-900 text-sm font-bold mb-2 uppercase tracking-widest">Sign In</h3>
                        <div className="h-[1px] bg-gray-200 w-full mb-6" />

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-gray-600">ID Number:</label>
                                <input
                                    type="text"
                                    className="w-full h-12 bg-gray-50 border border-gray-200 px-4 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 focus:bg-white transition-all font-bold"
                                    placeholder="TUPT-XX-XXXX"
                                    value={idNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    maxLength={12}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-gray-600">Password:</label>
                                <input
                                    type="password"
                                    className="w-full h-12 bg-gray-50 border border-gray-200 px-4 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 focus:bg-white transition-all font-bold"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[13px] font-bold text-gray-600">Birthdate:</label>
                                <input
                                    type="date"
                                    className="w-full h-12 bg-gray-50 border border-gray-200 px-4 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 focus:bg-white transition-all font-bold"
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
                                    className="bg-white text-gray-500 text-[11px] font-bold px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="bg-[#8b0000] text-white text-[11px] font-black px-8 py-2 border-2 border-transparent rounded-lg hover:bg-red-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? 'Wait...' : 'Sign In'}
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-gray-200 pt-6">
                                <p className="text-gray-600 text-[13px] font-medium mb-3">
                                    Don't have an account?{' '}
                                    <Link href="/register" className="text-red-700 font-black hover:underline underline-offset-4 decoration-2">
                                        Register here
                                    </Link>
                                </p>
                                <Link href="/forgot-password" title="Forgot Password" className="text-gray-400 text-[11px] font-bold hover:text-gray-700 transition-colors uppercase tracking-widest">
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
