'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/lib/api';
import CustomHeader from '@/components/Navigation/CustomHeader';

interface FormData {
    fullName: string;
    idNumber: string;
    birthdate: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        idNumber: '',
        birthdate: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (field: keyof FormData, value: string): void => {
        if (field === 'idNumber') {
            const val = value.toUpperCase();
            if (val.length < formData.idNumber.length) {
                setFormData(prev => ({ ...prev, idNumber: val }));
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
            setFormData(prev => ({ ...prev, idNumber: result.slice(0, 12) }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const validateIDNumber = (idNumber: string): boolean => {
        const idRegex = /^TUPT-\d{2}-\d{4}$/;
        return idRegex.test(idNumber);
    };

    const handleRegister = async (): Promise<void> => {
        const { fullName, idNumber, birthdate, password, confirmPassword } = formData;

        if (!fullName || !idNumber || !birthdate || !password || !confirmPassword) {
            toast.error('Please fill in all fields'); return;
        }
        if (!validateIDNumber(idNumber)) {
            toast.error('Please enter a valid ID number in format: TUPT-XX-XXXX'); return;
        }
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters long'); return; }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    idNumber: idNumber,
                    birthdate: birthdate,
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Account created successfully!');
                setTimeout(() => { router.push('/login'); }, 1500);
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Cannot connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = (): void => {
        setFormData({ fullName: '', idNumber: '', birthdate: '', password: '', confirmPassword: '' });
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') { handleRegister(); }
    };

    const inputInnerClasses = "w-full h-12 bg-gray-50 border border-gray-200 px-4 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 focus:bg-white transition-all font-bold";
    const labelClasses = "text-[13px] font-bold text-gray-600";

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-28 pb-12 px-6 relative overflow-hidden">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10">
                    <div className="p-6 md:p-8 pb-2">
                        <h3 className="text-gray-900 text-sm font-bold mb-2 uppercase tracking-widest">Create Account</h3>
                        <div className="h-[1px] bg-gray-200 w-full mb-6" />

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className={labelClasses}>Name:</label>
                                <input
                                    type="text"
                                    className={inputInnerClasses}
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClasses}>ID Number:</label>
                                <input
                                    type="text"
                                    className={inputInnerClasses}
                                    placeholder="TUPT-XX-XXXX"
                                    value={formData.idNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('idNumber', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    maxLength={12}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClasses}>Birthdate:</label>
                                <input
                                    type="date"
                                    className={inputInnerClasses}
                                    value={formData.birthdate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('birthdate', e.target.value)}
                                    max={mounted ? new Date().toISOString().split('T')[0] : undefined}
                                    suppressHydrationWarning={true}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClasses}>Password:</label>
                                    <input
                                        type="password"
                                        className={inputInnerClasses}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        suppressHydrationWarning={true}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClasses}>Repeat Password:</label>
                                    <input
                                        type="password"
                                        className={inputInnerClasses}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        suppressHydrationWarning={true}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 pb-4">
                                <button
                                    onClick={handleClear}
                                    className="bg-white text-gray-500 text-[11px] font-bold px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="bg-[#8b0000] text-white text-[11px] font-black px-8 py-2 border-2 border-transparent rounded-lg hover:bg-red-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? 'Wait...' : 'Register'}
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-gray-200 pt-6">
                                <p className="text-gray-600 text-[13px] font-medium mb-0">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-red-700 font-black hover:underline underline-offset-4 decoration-2">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
