import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '../components/UIComponents';
import { adminApi } from '../api/api';
import {
    Users,
    Package,
    MessageSquare,
    Star,
    Plus,
    Trash2,
    LayoutDashboard,
    Image as ImageIcon,
    BarChart3,
    LogOut,
    CheckCircle2,
    XCircle,
    Eye,
    MousePointer2,
    TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
    // ... code before ...
    const [stats, setStats] = useState(null);
    const [ads, setAds] = useState([]);
    const [adStats, setAdStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAd, setNewAd] = useState({
        title: '',
        ad_type: 'banner',
        position: '',
        link_url: '',
        start_date: '',
        end_date: '',
        media_type: 'image',
        duration: 5,
        file: null
    });
    const navigate = useNavigate();

    // Check admin auth
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchAllData();
        }
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            const [statsRes, adsRes, adStatsRes] = await Promise.all([
                adminApi.getStatsOverview(),
                adminApi.getAds(),
                adminApi.getAdStats()
            ]);

            setStats(statsRes.data);
            setAds(adsRes.data);
            setAdStats(adStatsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('admin_token');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        try {
            const res = await adminApi.getAds();
            setAds(res.data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const toggleAdStatus = async (adId, currentStatus) => {
        try {
            await adminApi.updateAd(adId, !currentStatus);
            fetchAds();
        } catch (error) {
            console.error('Error toggling ad:', error);
        }
    };

    const deleteAd = async (adId) => {
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;

        try {
            await adminApi.deleteAd(adId);
            fetchAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    const handleAddAd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newAd.title);
        formData.append('ad_type', newAd.ad_type);
        if (newAd.position) formData.append('position', newAd.position);
        if (newAd.link_url) formData.append('link_url', newAd.link_url);
        // Date formats might need conversion depending on backend expectations
        if (newAd.start_date) formData.append('start_date', newAd.start_date);
        if (newAd.end_date) formData.append('end_date', newAd.end_date);
        formData.append('media_type', newAd.media_type);
        formData.append('duration', newAd.duration);
        if (newAd.file) formData.append('file', newAd.file);

        try {
            const res = await adminApi.createAd(formData);
            if (res.data) {
                setShowAddModal(false);
                setNewAd({
                    title: '',
                    ad_type: 'banner',
                    position: '',
                    link_url: '',
                    start_date: '',
                    end_date: '',
                    media_type: 'image',
                    duration: 5,
                    file: null
                });
                fetchAllData();
            }
        } catch (error) {
            console.error('Error adding ad:', error);
            alert("Xatolik yuz berdi");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Admin <span className="text-purple-600">Panel</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all duration-300"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Chiqish</span>
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-2 -mb-px">
                        {[
                            { id: 'overview', label: 'Umumiy', icon: LayoutDashboard },
                            { id: 'ads', label: 'Reklamalar', icon: ImageIcon },
                            { id: 'analytics', label: 'Statistika', icon: BarChart3 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-all duration-300 ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Users size={28} />
                            </div>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Foydalanuvchilar</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total_users.toLocaleString()}</p>
                        </Card>

                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <Package size={28} />
                            </div>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">E'lonlar</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total_listings.toLocaleString()}</p>
                        </Card>

                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                <MessageSquare size={28} />
                            </div>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Xabarlar</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total_messages.toLocaleString()}</p>
                        </Card>

                        <Card className="p-6 border-none shadow-xl shadow-gray-200/50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-300">
                                <Star size={28} />
                            </div>
                            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Sharhlar</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total_reviews.toLocaleString()}</p>
                        </Card>
                    </div>
                )}

                {/* Ads Tab */}
                {activeTab === 'ads' && (
                    <div>
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-lg shadow-gray-200/40">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">Barcha Reklamalar</h2>
                                <p className="text-gray-500 font-medium">Jami {ads.length} ta faol va nofaol reklamalar</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-purple-600/30 transition-all active:scale-95"
                            >
                                <Plus size={20} />
                                Yangi Reklama
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {ads.map(ad => (
                                <Card key={ad.id} className="group overflow-hidden rounded-[32px] border-none shadow-xl shadow-gray-200/60 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={ad.image_url}
                                            alt={ad.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-white/90 backdrop-blur-md text-gray-900 border border-white/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                                                {ad.ad_type}
                                            </span>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${ad.is_active
                                                ? 'bg-green-500/90 text-white border-green-400'
                                                : 'bg-gray-500/90 text-white border-gray-400'
                                                }`}>
                                                {ad.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {ad.is_active ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-black text-lg text-gray-900 mb-6 line-clamp-1">{ad.title}</h3>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${ad.is_active
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                                    }`}
                                            >
                                                {ad.is_active ? 'O\'chirish' : 'Yoqish'}
                                            </button>
                                            <button
                                                onClick={() => deleteAd(ad.id)}
                                                className="w-12 h-12 bg-red-50 text-red-500 flex items-center justify-center rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-purple-600" size={28} />
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Reklama Analitikasi</h2>
                        </div>

                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Reklama</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Turi</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Ko'rishlar</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Bosishlar</th>
                                            <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Konversiya (CTR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {adStats.map(stat => (
                                            <tr key={stat.id} className="hover:bg-purple-50/30 transition-colors duration-200 group">
                                                <td className="px-10 py-6">
                                                    <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{stat.title}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{stat.type}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-gray-900 font-black">
                                                        <Eye size={14} className="text-blue-500" />
                                                        {stat.views.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-gray-900 font-black">
                                                        <MousePointer2 size={14} className="text-orange-500" />
                                                        {stat.clicks.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 min-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                                                style={{ width: `${Math.min(stat.ctr * 5, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-black ${stat.ctr > 5 ? 'text-green-600' : 'text-gray-900'}`}>{stat.ctr}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Ad Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] max-w-2xl w-full p-8 shadow-2xl shadow-purple-500/20 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Yangi Reklama Qo'shish</h2>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                <XCircle size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAd} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sarlavha</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                        placeholder="Reklama nomi..."
                                        value={newAd.title}
                                        onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Turi</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all appearance-none"
                                            value={newAd.ad_type}
                                            onChange={e => setNewAd({ ...newAd, ad_type: e.target.value })}
                                        >
                                            <option value="banner">Banner</option>
                                            <option value="splash">Splash (Kirish)</option>
                                            <option value="inline">Inline (Orasida)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Media Turi</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all appearance-none"
                                            value={newAd.media_type}
                                            onChange={e => setNewAd({ ...newAd, media_type: e.target.value })}
                                        >
                                            <option value="image">Rasm</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>

                                {newAd.ad_type === 'banner' && (
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">O'rni (Position)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                            value={newAd.position}
                                            onChange={e => setNewAd({ ...newAd, position: e.target.value })}
                                            placeholder="1, 2, 3..."
                                        />
                                    </div>
                                )}

                                {newAd.ad_type === 'splash' && (
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Davomiyligi (sekund)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                            value={newAd.duration}
                                            onChange={e => setNewAd({ ...newAd, duration: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Boshlanish Vaqti</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                            value={newAd.start_date}
                                            onChange={e => setNewAd({ ...newAd, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Tugash Vaqti</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                            value={newAd.end_date}
                                            onChange={e => setNewAd({ ...newAd, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Havola (Link URL)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                        value={newAd.link_url}
                                        onChange={e => setNewAd({ ...newAd, link_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Media Fayli</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="ad-file"
                                            className="hidden"
                                            onChange={e => setNewAd({ ...newAd, file: e.target.files[0] })}
                                            required
                                            accept="image/*,video/*"
                                        />
                                        <label
                                            htmlFor="ad-file"
                                            className="w-full bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-purple-400"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                                                <Plus size={24} />
                                            </div>
                                            <span className="font-bold text-purple-700">
                                                {newAd.file ? newAd.file.name : 'Faylni tanlang yoki shu yerga tashlang'}
                                            </span>
                                            <span className="text-xs text-purple-400 mt-1 font-medium">PNG, JPG, MP4 max 20MB</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 px-6 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 px-6 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/30 hover:bg-purple-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
