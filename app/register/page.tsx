'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import API_BASE_URL from '@/lib/api';
import CustomHeader from '@/components/Navigation/CustomHeader';
import LottieLoader from '@/components/UI/LottieLoader';

interface FormData {
    fullName: string;
    idNumber: string;
    birthdate: string;
    password: string;
    confirmPassword: string;
    isGraduate: boolean;
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
        isGraduate: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (field: keyof FormData, value: string | boolean): void => {
        if (field === 'idNumber' && typeof value === 'string') {
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

        const startTime = Date.now();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    idNumber: idNumber,
                    birthdate: birthdate,
                    password: password,
                    isGraduate: formData.isGraduate
                }),
            });

            const data = await response.json();

            // Ensure minimum 3s delay
            const elapsed = Date.now() - startTime;
            if (elapsed < 3000) {
                await new Promise(resolve => setTimeout(resolve, 3000 - elapsed));
            }

            if (response.ok) {
                toast.success(data.message || 'Account created successfully!');
                setTimeout(() => { router.push('/login'); }, 1500);
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
        setFormData({ fullName: '', idNumber: '', birthdate: '', password: '', confirmPassword: '', isGraduate: false });
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') { handleRegister(); }
    };

    const inputInnerClasses = "w-full h-12 bg-surface border border-border-custom px-4 rounded-xl text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all font-bold";
    const labelClasses = "text-[13px] font-bold text-text-dim";

    return (
        <div className="min-h-screen bg-transparent flex flex-col font-sans">
            <CustomHeader isLanding={false} />
            <div className="flex-1 flex items-center justify-center pt-28 pb-12 px-6 relative overflow-hidden">
                <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border-custom overflow-hidden relative z-10">
                    <div className="p-6 md:p-8 pb-2">
                        <h3 className="text-foreground text-sm font-bold mb-2 uppercase tracking-widest">Create Account</h3>
                        <div className="h-[1px] bg-border-custom w-full mb-6" />

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

                            <div className="flex items-center space-x-2 pt-2 pb-2">
                                <input
                                    type="checkbox"
                                    id="isGraduate"
                                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                                    checked={formData.isGraduate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, isGraduate: e.target.checked }))}
                                />
                                <label htmlFor="isGraduate" className="text-sm font-bold text-text-dim cursor-pointer">
                                    I am a Graduate Student
                                </label>
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
                                    className="bg-card text-text-dim text-[11px] font-bold px-4 py-2 border-2 border-border-custom rounded-lg hover:bg-surface hover:text-foreground transition-colors"
                                >
                                    Clear
                                </button>

                                {isLoading && <LottieLoader isModal type="general" text="Creating account..." />}

                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="bg-primary/5 border border-primary/30 text-primary font-black text-[11px] uppercase tracking-[0.2em] px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] active:scale-95 active:bg-primary/30 flex items-center gap-2"
                                >
                                    Register Account
                                </button>
                            </div>

                            <div className="pb-4 text-center border-t border-border-custom pt-6">
                                <p className="text-text-dim text-[13px] font-medium mb-0">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-teal-700 font-black hover:underline underline-offset-4 decoration-2">
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
