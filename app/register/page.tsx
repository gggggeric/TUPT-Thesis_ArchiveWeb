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
            value = formattedValue;
        }

        setFormData(prev => ({ ...prev, [field]: value }));
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

    const inputInnerClasses = "w-full h-12 bg-white/5 border border-white/20 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10 transition-all font-bold";
    const labelClasses = "text-[13px] font-bold text-[#fecaca]";

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden">
                <div className="w-full max-w-lg bg-gradient-to-br from-[#8b0000] to-[#500000] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-4 border-[#8b0000]/20 overflow-hidden relative z-10">
                    <div className="p-4 md:p-8 pb-2">
                        <h3 className="text-white text-sm font-bold mb-2 uppercase tracking-widest">Create Account</h3>
                        <div className="h-[1px] bg-white/40 w-full mb-6" />

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
                                />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClasses}>Birthdate:</label>
                                <input
                                    type="date"
                                    className={`${inputInnerClasses} [color-scheme:dark]`}
                                    value={formData.birthdate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('birthdate', e.target.value)}
                                    max={mounted ? new Date().toISOString().split('T')[0] : undefined}
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
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 pb-4">
                                <button
                                    onClick={handleClear}
                                    className="bg-transparent text-white/60 text-[11px] font-bold px-4 py-2 border-2 border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="bg-white text-[#8b0000] text-[11px] font-black px-8 py-2 border-2 border-white rounded-lg hover:bg-[#fecaca] transition-all flex items-center gap-2 shadow-lg"
                                >
                                    {isLoading ? 'Wait...' : 'Register'}
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-white/10 pt-6">
                                <p className="text-white/80 text-[13px] font-medium mb-0">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-white font-black hover:underline underline-offset-4 decoration-2">
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
