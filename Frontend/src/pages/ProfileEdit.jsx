import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/api';
import { Button, Input, Spinner } from '../components/UIComponents';
import {
    User,
    MapPin,
    AlignLeft,
    ChevronLeft,
    Camera,
    Check,
    Briefcase
} from 'lucide-react';

const ProfileEdit = () => {
    const [profile, setProfile] = useState({ bio: '', region: '', full_name: '', avatar_url: '', category_id: 1 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await profileApi.getMe();
            setProfile({
                bio: res.data.bio || '',
                region: res.data.region || '',
                category_id: res.data.category_id || 1,
                full_name: res.data.full_name || '',
                avatar_url: res.data.avatar_url || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await profileApi.uploadAvatar(formData);
            setProfile(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
        } catch (err) {
            alert("Rasmni yuklashda xatolik");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await profileApi.updateMe(profile);
            navigate('/dashboard');
        } catch (err) {
            alert("Saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Spinner size="lg" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* iOS Style Header */}
            <div className="bg-[#f9fafb] pt-12 pb-6 px-6 rounded-b-[32px] border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-[17px] font-black text-gray-900">Profilni tahrirlash</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-[#7c3aed] font-black text-[15px] disabled:opacity-50"
                >
                    {saving ? '...' : 'Saqlash'}
                </button>
            </div>

            <div className="px-6 pt-10 max-w-2xl mx-auto">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10">
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="relative cursor-pointer group"
                    >
                        <div className="w-28 h-28 rounded-[36px] bg-[#f3f4f6] border-[4px] border-white overflow-hidden flex items-center justify-center shadow-xl ring-4 ring-[#7c3aed]/5 transition-transform group-hover:scale-105">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-300" />
                            )}
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#7c3aed] rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                            <Camera size={16} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                    </div>
                    <p className="mt-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">Suratni o'zgartirish</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase ml-1">To'liq ism</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Ismingizni kiriting"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                className="pl-12 py-4 bg-[#f9fafb] border-gray-100 rounded-2xl focus:bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Hudud</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Hududni kiriting (Masalan: Toshkent)"
                                value={profile.region}
                                onChange={e => setProfile({ ...profile, region: e.target.value })}
                                className="pl-12 py-4 bg-[#f9fafb] border-gray-100 rounded-2xl focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Mutaxassislik</label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-4 top-4 text-gray-400" />
                            <textarea
                                placeholder="Mutaxassisligingiz haqida qisqacha..."
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-[#f9fafb] border border-gray-100 rounded-2xl min-h-[140px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            type="submit"
                            className="w-full py-4 rounded-2xl shadow-lg shadow-[#7c3aed]/20"
                            disabled={saving}
                        >
                            {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;
