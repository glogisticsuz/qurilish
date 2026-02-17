import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, authApi } from '../api/api';
import { Button, Input, Spinner } from '../components/UIComponents';
import {
    Camera,
    MapPin,
    Briefcase,
    Trash2,
    LogOut,
    Settings,
    Plus,
    ChevronLeft,
    ChevronDown,
    ShieldCheck,
    Image as ImageIcon,
    Home as HomeIcon,
    ClipboardList,
    MessageSquare,
    User,
    DollarSign,
    Layers,
    Search
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('ads'); // 'ads' or 'upload'

    const [newItem, setNewItem] = useState({ title: '', price: '', price_type: 'soat', category_id: 1 });
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();

    const categories = [
        { id: 1, name: 'Ustalar', icon: '👷', role: 'pro' },
        { id: 2, name: 'Texnika ijarasi', icon: '🚜', role: 'supplier' },
        { id: 3, name: 'Qurilish mollari', icon: '🧱', role: 'supplier' },
        { id: 4, name: 'Prorablar', icon: '📋', role: 'pro' },
        { id: 6, name: 'Boshqa xizmatlar', icon: '🛠️', role: 'pro' }
    ];

    const filteredCategories = categories.filter(c => c.role === user?.role || user?.role === 'admin');

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
            setPortfolio(portfolioRes.data || []);
        } catch (err) {
            console.error("Ma'lumotlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file) return alert("Rasm tanlang");

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', newItem.title);
        formData.append('price', newItem.price || 0);
        formData.append('price_type', newItem.price_type);
        formData.append('category_id', newItem.category_id || (filteredCategories[0]?.id || 1));

        try {
            await profileApi.uploadPortfolio(formData);
            setNewItem({ title: '', price: '', price_type: 'soat', category_id: filteredCategories[0]?.id || 1 });
            setFile(null);
            fetchData();
            setActiveTab('ads');
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

    const handleLogout = () => {
        if (confirm("Haqiqatan ham chiqmoqchimisiz?")) {
            localStorage.removeItem('token');
            navigate('/login');
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
            <div className="bg-[#f9fafb] pt-12 pb-8 px-6 rounded-b-[32px] border-b border-gray-100">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-[28px] bg-white border-[3px] border-[#ddd6fe] overflow-hidden flex items-center justify-center shadow-sm">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={32} className="text-gray-300" />
                                )}
                            </div>
                            {profile?.is_verified && (
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-bold">
                                    ✓
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-[22px] font-black text-gray-900 leading-tight">
                                {profile?.full_name || 'Foydalanuvchi'}
                            </h1>
                            <p className="text-gray-500 text-sm mb-2">{user?.phone}</p>
                            <div className="flex gap-1.5">
                                <div className="bg-white border border-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <MapPin size={12} className="text-[#7c3aed]" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{profile?.region || 'Hudud'}</span>
                                </div>
                                <div className="bg-[#7c3aed] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <Briefcase size={12} className="text-white" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 shadow-sm transition-transform active:scale-90"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 bg-white border border-red-100 rounded-xl flex items-center justify-center text-red-500 shadow-sm transition-transform active:scale-90"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 bg-white border-gray-100 h-12 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-sm"
                        onClick={() => navigate('/')}
                    >
                        Asosiy sahifa
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 h-12 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-[#7c3aed]/20"
                        onClick={() => navigate('/messages')}
                    >
                        Xabarlar
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pt-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-black text-gray-900">Mening e'lonlarim</h2>
                    <button
                        onClick={() => setActiveTab(activeTab === 'ads' ? 'upload' : 'ads')}
                        className={`flex items-center gap-2 pr-5 pl-4 py-2.5 rounded-2xl text-white font-black text-[13px] uppercase tracking-wider transition-all shadow-lg active:scale-95 ${activeTab === 'upload' ? 'bg-gray-400 rotate-0' : 'bg-[#10b981] shadow-[#10b981]/20'
                            }`}
                    >
                        <div className={`transition-transform duration-300 ${activeTab === 'upload' ? 'rotate-45' : ''}`}>
                            <Plus size={20} />
                        </div>
                        {activeTab === 'ads' && <span>Yangi e'lon</span>}
                    </button>
                </div>

                {activeTab === 'upload' ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Form Section: Basic Info */}
                            <div className="bg-[#f9fafb] p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Asosiy ma'lumotlar</p>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-gray-900 uppercase ml-1 opacity-70">Sarlavha</label>
                                    <div className="relative">
                                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <Input
                                            placeholder="Masalan: Kran ijarasi yoki Devor urish..."
                                            value={newItem.title}
                                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                            className="pl-12 py-4 bg-white border-white rounded-2xl focus:ring-2 focus:ring-[#7c3aed]/10 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-gray-900 uppercase ml-1 opacity-70">Bo'lim (Kategoriya)</label>
                                    <div className="relative">
                                        <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <select
                                            value={newItem.category_id}
                                            onChange={e => setNewItem({ ...newItem, category_id: parseInt(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-white rounded-2xl text-[15px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/10 transition-all"
                                        >
                                            {filteredCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Form Section: Price */}
                            <div className="bg-[#f9fafb] p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Narx va Shartlar</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-900 uppercase ml-1 opacity-70">Narxi (So'm)</label>
                                        <div className="relative">
                                            <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <Input
                                                type="number"
                                                placeholder="100,000"
                                                value={newItem.price}
                                                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                                className="pl-12 py-4 bg-white border-white rounded-2xl transition-all font-black text-[#7c3aed]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-900 uppercase ml-1 opacity-70">O'lchov birligi</label>
                                        <div className="relative">
                                            <select
                                                value={newItem.price_type}
                                                onChange={e => setNewItem({ ...newItem, price_type: e.target.value })}
                                                className="w-full px-4 py-4 bg-white border border-white rounded-2xl text-[15px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/10 transition-all"
                                            >
                                                <option value="soat">Soatiga</option>
                                                <option value="kun">Kuniga</option>
                                                <option value="smena">Smenasiga</option>
                                                <option value="kv/m">Kv.m</option>
                                                <option value="kelishilgan">Kelishilgan</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Section: Media */}
                            <div className="bg-[#f9fafb] p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Media (Rasm)</p>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative h-44 bg-white border-2 border-dashed border-gray-100 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:border-[#7c3aed] hover:bg-[#7c3aed]/5 transition-all group"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={e => setFile(e.target.files[0])}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    {file ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-2">
                                                <ImageIcon size={32} />
                                            </div>
                                            <p className="text-[14px] font-black text-[#7c3aed] truncate max-w-[240px]">{file.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">O'zgartirish uchun bosing</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-2 group-hover:bg-[#7c3aed]/10 group-hover:text-[#7c3aed] transition-colors">
                                                <Camera size={32} />
                                            </div>
                                            <p className="text-[14px] font-black text-gray-400 group-hover:text-[#7c3aed]">Rasm yuklang</p>
                                            <p className="text-[10px] text-gray-300 uppercase font-black mt-1">Sifatli rasm ko'proq mijoz jalb qiladi</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full py-5 rounded-[24px] shadow-xl shadow-[#7c3aed]/20 font-black uppercase tracking-widest text-[14px] h-16"
                                disabled={uploading || !newItem.title || !file}
                            >
                                {uploading ? 'Yuklanmoqda...' : 'Publikatsiya qilish'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.map(item => (
                            <div key={item.id} className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-premium flex flex-col group transition-all hover:shadow-xl hover:translate-y-[-4px]">
                                <div className="relative aspect-[16/11] overflow-hidden bg-gray-50">
                                    <img src={item.image_url1} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/20">
                                            <p className="text-[#7c3aed] font-black text-[14px]">
                                                {item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan'}
                                                <span className="text-gray-400 text-[9px] uppercase font-black ml-1">/ {item.price_type}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-[17px] font-black text-gray-900 mb-1 truncate leading-tight">{item.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Aktiv e'lon</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {portfolio.length === 0 && (
                            <div className="col-span-full py-24 bg-[#f9fafb] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-gray-200 mb-4 shadow-sm border border-gray-100">
                                    <Plus size={40} />
                                </div>
                                <p className="font-black text-[15px] uppercase tracking-widest text-gray-400">E'lonlar mavjud emas</p>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className="mt-4 text-[#7c3aed] font-black text-[12px] uppercase tracking-widest underline decoration-2 underline-offset-4"
                                >
                                    Birinchisini qo'shish
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center py-3 px-2 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <HomeIcon size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Asosiy</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 min-w-[64px] text-[#7c3aed] transition-all"
                >
                    <div className="relative">
                        <ClipboardList size={24} />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#7c3aed] rounded-full shadow-lg shadow-[#7c3aed]/40" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">Kabinet</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <Search size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Qidiruv</span>
                </button>
                <button
                    onClick={() => navigate('/messages')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <MessageSquare size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Xabarlar</span>
                </button>
                <button
                    onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/login')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <User size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Profil</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
