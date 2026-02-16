import React, { useState, useEffect } from 'react';
import { Button, Input, GlassCard } from '../components/UIComponents';
import { profileApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, AlignLeft, ArrowLeft } from 'lucide-react';

const ProfileEdit = () => {
    const [profile, setProfile] = useState({ bio: '', region: '', full_name: '', avatar_url: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = React.useRef();

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
            setProfile({ ...profile, avatar_url: res.data.avatar_url });
        } catch (err) {
            alert("Rasmni yuklashda xatolik");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
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

    if (loading) return null;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto py-12">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-accent/40 hover:text-primary mb-8 transition-colors uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} /> Ortga qaytish
                </button>

                <h1 className="text-4xl font-heading font-black mb-8">Profilni Tahrirlash</h1>

                <GlassCard className="p-8 border-primary/10">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="flex flex-col items-center mb-8">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden bg-white/5 flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-primary/20" />
                                    )}
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                    <span className="text-[10px] uppercase font-bold text-white">O'zgartirish</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <p className="mt-4 text-[10px] uppercase tracking-widest text-accent/40 font-bold">Profil rasmi (Gallery/File)</p>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent/40 font-bold">
                                👤 To'liq ism (Nickname)
                            </label>
                            <Input
                                placeholder="Masalan: Ali Valiyev"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent/40 font-bold">
                                ⭐ Bo'lim (Kategoriya)
                            </label>
                            <select
                                className="input-field w-full appearance-none bg-background border-white/10"
                                value={profile.category_id}
                                onChange={e => setProfile({ ...profile, category_id: parseInt(e.target.value) })}
                            >
                                <option value={1}>👷 Ustalar</option>
                                <option value={2}>🚜 Texnika Ijarasi</option>
                                <option value={3}>🧱 Qurilish Mollari</option>
                                <option value={4}>📋 Prorablar</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent/40 font-bold">
                                <MapPin size={14} className="text-primary" /> Hudud / Manzil
                            </label>
                            <Input
                                placeholder="Masalan: Toshkent sh., Chilonzor"
                                value={profile.region}
                                onChange={e => setProfile({ ...profile, region: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent/40 font-bold">
                                <AlignLeft size={14} className="text-primary" /> Mutaxassislik / Tavsif
                            </label>
                            <textarea
                                className="input-field w-full min-h-[150px] resize-none"
                                placeholder="O'zingiz va xizmatlaringiz haqida batafsil ma'lumot bering..."
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full py-4 text-sm" disabled={saving}>
                                {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default ProfileEdit;
