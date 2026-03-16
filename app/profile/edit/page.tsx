'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    FaUser,
    FaCalendarAlt,
    FaLock,
    FaSave,
    FaTimes,
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaCamera,
    FaEnvelope
} from 'react-icons/fa';
import CustomHeader from '@/components/Navigation/CustomHeader';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';
import Footer from '@/components/Navigation/Footer';
import API_BASE_URL from '@/lib/api';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    idNumber: string;
    birthdate: string;
    age: number;
    avatar?: string;
    profilePhoto?: string;
    department?: string;
    student_id?: string;
    createdAt: string;
}

const EditProfilePage = () => {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const user: UserData = JSON.parse(userData);
        setFormData(prev => ({
            ...prev,
            name: user.name,
            birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : ''
        }));
        setCurrentPhoto(user.profilePhoto || null);
    }, [router]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async (isSubmitting = false) => {
        if (!selectedPhoto) return true;

        setIsUploadingPhoto(true);
        try {
            const token = localStorage.getItem('token');
            const uploadFormData = new FormData();
            uploadFormData.append('photo', selectedPhoto);

            const response = await fetch(`${API_BASE_URL}/user/profile-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadFormData
            });

            const data = await response.json();

            if (response.ok) {
                if (!isSubmitting) toast.success('Profile photo updated!');
                setCurrentPhoto(data.data.profilePhoto);
                setPhotoPreview(null);
                setSelectedPhoto(null);
                
                // Update local storage
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                return true;
            } else {
                toast.error(data.message || 'Photo upload failed');
                return false;
            }
        } catch (err) {
            console.error('Photo upload error:', err);
            toast.error('Failed to upload photo');
            return false;
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword && !formData.currentPassword) {
            toast.error('Current password is required to set a new password');
            return;
        }

        setIsLoading(true);

        try {
            // Automatically upload photo if one is selected
            if (selectedPhoto) {
                const photoSuccess = await handlePhotoUpload(true);
                if (!photoSuccess) {
                    setIsLoading(false);
                    return;
                }
            }

            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userData._id,
                    name: formData.name,
                    birthdate: formData.birthdate,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update localStorage with the latest user data from the server
                // This ensures createdAt and other system fields remain accurate
                localStorage.setItem('userData', JSON.stringify(data.data.user));

                toast.success('Profile updated successfully!');
                router.push('/profile');
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Cannot connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans text-foreground selection:bg-[#2DD4BF] selection:text-white">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2DD4BF]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[#2DD4BF]/10 rounded-full blur-[100px] pointer-events-none" />

            <CustomHeader onMenuPress={() => setMenuVisible(true)} />
            <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

            <main className="flex-1 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full relative z-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-2 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-text-dim transition-all"
                    >
                        <FaArrowLeft className="text-[8px]" /> Cancel Edit
                    </button>
                    <h2 className="text-sm font-black text-foreground tracking-[0.2em] uppercase flex items-center gap-4">
                        <span className="w-2 h-7 bg-[#2DD4BF] rounded-full" />
                        Edit Profile Details
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="bg-card rounded-[2.5rem] shadow-xl border border-border-custom overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
                    <div className="p-6 md:p-10 space-y-12 relative z-10">
                        {/* Section: Profile Photo */}
                        <div className="flex flex-col items-center justify-center space-y-6 pb-6 border-b border-border-custom">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-teal-50 shadow-xl overflow-hidden bg-surface flex items-center justify-center relative transition-all group-hover:border-teal-100">
                                    {photoPreview || currentPhoto ? (
                                        <img 
                                            src={photoPreview || (currentPhoto?.startsWith('http') ? currentPhoto : `${API_BASE_URL}${currentPhoto}`)} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="text-4xl text-gray-200" />
                                    )}
                                    
                                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <FaCamera className="text-xl mb-1" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Change</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    </label>
                                </div>
                                
                                {selectedPhoto && (
                                    <div className="absolute -bottom-2 -right-2 flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); }}
                                            className="p-2 bg-card rounded-full shadow-lg text-gray-400 hover:text-primary transition-colors border border-border-custom"
                                        >
                                            <FaTimes className="text-[10px]" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] mb-1">Profile Picture</h3>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                                    JPG, PNG up to 2MB recommended
                                </p>
                            </div>
                        </div>

                        {/* Section: Basic Information */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-teal-700 uppercase tracking-[0.2em] border-b border-border-custom pb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                                        <FaUser className="text-primary" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-surface border border-border-custom px-5 py-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all text-foreground placeholder:text-gray-400"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                                        <FaCalendarAlt className="text-primary" /> Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-surface border border-border-custom px-5 py-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all text-foreground"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Security */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border-custom pb-4 text-foreground">
                                <h3 className="text-[11px] font-black text-teal-700 uppercase tracking-[0.2em]">Security & Password</h3>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Leave blank to keep current password</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                                        <FaLock className="text-primary" /> Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full bg-surface border border-border-custom px-5 py-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all text-foreground placeholder:text-gray-400"
                                            placeholder="Required only for password change"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DD4BF] transition-colors p-2"
                                        >
                                            {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full bg-surface border border-border-custom px-5 py-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all text-foreground placeholder:text-gray-400"
                                                placeholder="New password"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DD4BF] transition-colors p-2"
                                            >
                                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-dim uppercase tracking-widest flex items-center gap-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                name="confirmNewPassword"
                                                value={formData.confirmNewPassword}
                                                onChange={handleChange}
                                                className="w-full bg-surface border border-border-custom px-5 py-4 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all text-foreground placeholder:text-gray-400"
                                                placeholder="Confirm new password"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2DD4BF] transition-colors p-2"
                                            >
                                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="bg-surface p-8 border-t border-border-custom flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/profile')}
                            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-card text-text-dim font-black uppercase tracking-[0.2em] text-[10px] border border-border-custom hover:bg-gray-100 hover:text-foreground transition-all flex items-center justify-center gap-3"
                        >
                            <FaTimes /> Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-[#2DD4BF] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-sm" /> Save Profile Details
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center pb-20">
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em]">
                        Student Identity Management • Institutional Security
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EditProfilePage;
