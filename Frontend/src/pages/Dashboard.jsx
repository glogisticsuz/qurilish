import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, GlassCard, Badge } from '../components/UIComponents';
import { profileApi, authApi } from '../api/api';
import { Plus, Trash2, Camera, MapPin, Briefcase, ChevronDown } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [newItem, setNewItem] = useState({ title: '', price: '', price_type: 'soat', category_id: 1 });
    const [file, setFile] = useState(null);

    const categories = [
        { id: 1, name: 'Ustalar', icon: '👷', role: 'pro' },
        { id: 2, name: 'Texnika Ijarasi', icon: '🚜', role: 'supplier' },
        { id: 3, name: 'Qurilish Mollari', icon: '🧱', role: 'supplier' },
        { id: 4, name: 'Prorablar', icon: '📋', role: 'pro' },
    ];

    const filteredCategories = categories.filter(c => c.role === user?.role);

    useEffect(() => {
        if (user && filteredCategories.length > 0 && !newItem.category_id) {
            setNewItem(prev => ({ ...prev, category_id: filteredCategories[0].id }));
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, profileRes, portfolioRes] = await Promise.all([
                authApi.getMe(),
                profileApi.getMe(),
                profileApi.getMyPortfolio()
            ]);
            setUser(userRes.data);
            setProfile(profileRes.data);
            setPortfolio(portfolioRes.data);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Rasm tanlang");

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', newItem.title);
        formData.append('price', newItem.price || 0);
        formData.append('price_type', newItem.price_type);
        formData.append('category_id', newItem.category_id);

        try {
            await profileApi.uploadPortfolio(formData);
            setNewItem({
                title: '',
                price: '',
                price_type: 'soat',
                category_id: filteredCategories[0]?.id || 1
            });
            setFile(null);
            fetchData();
        } catch (err) {
            alert("Yuklashda xatolik yuz berdi");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm("O'chirmoqchimisiz?")) return;
        try {
            await profileApi.deletePortfolio(itemId);
            setPortfolio(portfolio.filter(item => item.id !== itemId));
        } catch (err) {
            alert("O'chirishda xatolik");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Profile Header */}
                <div className="mb-12 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden bg-white/5 flex items-center justify-center">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-10 h-10 text-primary/20" />
                            )}
                        </div>
                        <div className="absolute -top-2 -right-2">
                            {profile?.is_verified && <Badge variant="primary">Verified</Badge>}
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-heading font-black mb-2 text-white">{profile?.full_name || 'Shaxsiy Kabinet'}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-accent/60">
                            <span className="flex items-center gap-1 text-sm uppercase tracking-widest"><MapPin size={14} className="text-primary" /> {profile?.region || 'Hudud ko\'rsatilmagan'}</span>
                            <span className="flex items-center gap-1 text-sm uppercase tracking-widest text-primary"><Briefcase size={14} className="text-primary" /> {user?.role?.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            className="px-6 py-2 text-xs"
                            onClick={() => navigate('/')}
                        >
                            Asosiy Sahifa
                        </Button>
                        <Button
                            variant="secondary"
                            className="px-6 py-2 text-xs border-primary/30 text-primary"
                            onClick={() => navigate('/messages')}
                        >
                            Xabarlar 💬
                        </Button>
                        <Button
                            variant="primary"
                            className="px-6 py-2 text-xs"
                            onClick={() => navigate('/profile/edit')}
                        >
                            Profilni Tahrirlash
                        </Button>
                        <Button
                            className="px-6 py-2 text-xs bg-danger/20 text-danger hover:bg-danger hover:text-white border-none"
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                        >
                            Chiqish
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {user?.role === 'customer' ? (
                        <div className="lg:col-span-3 py-20 bg-white/5 rounded-3xl border border-white/5 text-center px-6">
                            <h2 className="text-2xl font-heading font-black mb-4">Siz hozircha "Mizoj" rolidasiz</h2>
                            <p className="text-accent/50 mb-8 max-w-lg mx-auto uppercase tracking-widest text-xs leading-loose">
                                E'lonlar yuklash va xizmat ko'rsatish imkoniyati faqat Usta va Texnika egalari uchun mavjud.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/login');
                                }}
                                className="px-8 py-4"
                            >
                                Rolni o'zgartirish (Usta bo'lib kirish)
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Portfolio Section */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-heading font-bold">
                                        {user?.role === 'supplier' ? 'Mening Texnikalarim' : 'Mening Ishlarim'}
                                    </h2>
                                    <Badge variant="success">{portfolio.length} ta</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {portfolio.map(item => (
                                        <GlassCard key={item.id} className="relative group border-white/5">
                                            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-500" />
                                            <div className="p-4">
                                                <h3 className="text-lg mb-1 truncate">{item.title}</h3>
                                                <p className="text-primary font-bold">{item.price ? item.price.toLocaleString() : '0'} <span className="text-[10px] text-accent/40 uppercase">so'm / {item.price_type}</span></p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-2 right-2 p-2 bg-danger/20 text-danger rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-white"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </GlassCard>
                                    ))}

                                    {portfolio.length === 0 && (
                                        <div className="col-span-2 py-20 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-accent/20">
                                            <Plus size={48} className="mb-4" />
                                            <p className="uppercase tracking-widest text-xs">Hali e'lonlar yuklanmagan</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Sidebar */}
                            <div>
                                <GlassCard className="p-6 sticky top-24 border-primary/20">
                                    <h2 className="text-xl font-heading font-bold mb-6 text-primary flex items-center gap-2">
                                        <Plus size={20} /> {user?.role === 'supplier' ? 'Yangi texnika' : 'Yangi ish'} yuklash
                                    </h2>
                                    <form onSubmit={handleUpload} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent/40">Sarlavha</label>
                                            <Input
                                                placeholder={user?.role === 'supplier' ? "Masalan: Kran 25t..." : "Masalan: Uy suvoqlash..."}
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent/40 font-bold">Bo'lim (Kategoriya)</label>
                                            <div className="relative">
                                                <select
                                                    className="input-field w-full appearance-none bg-background border-white/10 pr-10"
                                                    value={newItem.category_id}
                                                    onChange={e => setNewItem({ ...newItem, category_id: parseInt(e.target.value) })}
                                                >
                                                    {filteredCategories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.icon} {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none" size={14} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent/40">Narxi</label>
                                                <Input
                                                    placeholder="100,000"
                                                    type="number"
                                                    value={newItem.price}
                                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-accent/40">Turi</label>
                                                <select
                                                    className="input-field w-full appearance-none bg-background border-white/10"
                                                    value={newItem.price_type}
                                                    onChange={e => setNewItem({ ...newItem, price_type: e.target.value })}
                                                >
                                                    <option value="soat">Soatiga</option>
                                                    <option value="kun">Kuniga</option>
                                                    <option value="smena">Smenasiga</option>
                                                    <option value="kv/m">Kv.m</option>
                                                    <option value="kelishilgan">Kelishilgan</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-accent/40">Rasm yuklash</label>
                                            <div className="relative h-32 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-white/5">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={e => setFile(e.target.files[0])}
                                                    accept="image/*"
                                                />
                                                {file ? (
                                                    <p className="text-xs text-primary truncate max-w-[80%]">{file.name}</p>
                                                ) : (
                                                    <>
                                                        <Camera className="text-accent/20 mb-2" />
                                                        <p className="text-[10px] uppercase tracking-tighter text-accent/40">Rasm tanlash</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button className="w-full mt-4 py-4" disabled={uploading}>
                                            {uploading ? 'Yuklanmoqda...' : 'Publikatsiya qilish'}
                                        </Button>
                                    </form>
                                </GlassCard>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
