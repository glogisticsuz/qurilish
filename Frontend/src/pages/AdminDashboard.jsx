import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from '../components/UIComponents';

const AdminDashboard = () => {
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
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        } else {
            fetchAllData();
        }
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, adsRes, adStatsRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats/overview`, { headers }),
                fetch(`${API_URL}/admin/ads`, { headers }),
                fetch(`${API_URL}/admin/stats/ads`, { headers })
            ]);

            if (!statsRes.ok || !adsRes.ok || !adStatsRes.ok) {
                throw new Error('Failed to fetch data');
            }

            setStats(await statsRes.json());
            setAds(await adsRes.json());
            setAdStats(await adStatsRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
            // Optionally, handle token expiration or invalid token here
            if (error.message === 'Failed to fetch data' && error.response && error.response.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const adsRes = await fetch(`${API_URL}/admin/ads`, { headers });
            if (!adsRes.ok) throw new Error('Failed to fetch ads');
            setAds(await adsRes.json());
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const toggleAdStatus = async (adId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`${API_URL}/admin/ads/${adId}?is_active=${!currentStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAds();
        } catch (error) {
            console.error('Error toggling ad:', error);
        }
    };

    const deleteAd = async (adId) => {
        if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;

        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`${API_URL}/admin/ads/${adId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        if (newAd.start_date) formData.append('start_date', newAd.start_date);
        if (newAd.end_date) formData.append('end_date', newAd.end_date);
        formData.append('media_type', newAd.media_type);
        formData.append('duration', newAd.duration);
        if (newAd.file) formData.append('file', newAd.file);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/ads`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
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
                fetchData();
            } else {
                alert("Xatolik yuz berdi");
            }
        } catch (error) {
            console.error('Error adding ad:', error);
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
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin Panel - <span className="text-purple-600">MegaStroy</span>
                    </h1>
                    <Button variant="danger" size="sm" onClick={handleLogout}>
                        Chiqish
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-4">
                        {['overview', 'ads', 'analytics'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'overview' && 'Umumiy'}
                                {tab === 'ads' && 'Reklamalar'}
                                {tab === 'analytics' && 'Statistika'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="text-3xl mb-2">👥</div>
                            <p className="text-gray-600 text-sm">Jami Foydalanuvchilar</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users}</p>
                        </Card>
                        <Card className="p-6">
                            <div className="text-3xl mb-2">📦</div>
                            <p className="text-gray-600 text-sm">Jami E'lonlar</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_listings}</p>
                        </Card>
                        <Card className="p-6">
                            <div className="text-3xl mb-2">💬</div>
                            <p className="text-gray-600 text-sm">Jami Xabarlar</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_messages}</p>
                        </Card>
                        <Card className="p-6">
                            <div className="text-3xl mb-2">⭐</div>
                            <p className="text-gray-600 text-sm">Jami Sharhlar</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_reviews}</p>
                        </Card>
                    </div>
                )}

                {/* Ads Tab */}
                {activeTab === 'ads' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Barcha Reklamalar</h2>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600 text-sm">
                                    Jami: {ads.length} ta reklama
                                </p>
                                <Button onClick={() => setShowAddModal(true)}>
                                    + Reklama Qo'shish
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ads.map(ad => (
                                <Card key={ad.id} className="overflow-hidden">
                                    <img
                                        src={ad.image_url}
                                        alt={ad.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2">{ad.title}</h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                                {ad.ad_type}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded ${ad.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {ad.is_active ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={ad.is_active ? 'secondary' : 'success'}
                                                onClick={() => handleToggleAd(ad.id, ad.is_active)}
                                                className="flex-1"
                                            >
                                                {ad.is_active ? 'O\'chirish' : 'Yoqish'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDeleteAd(ad.id)}
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Reklama Statistikasi</h2>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Reklama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Turi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Ko'rishlar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Bosishlar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            CTR %
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {adStats.map(stat => (
                                        <tr key={stat.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {stat.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {stat.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {stat.views.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {stat.clicks.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`font-medium ${stat.ctr > 5 ? 'text-green-600' : 'text-gray-600'
                                                    }`}>
                                                    {stat.ctr}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Ad Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Yangi Reklama Qo'shish</h2>
                        <form onSubmit={handleAddAd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Sarlavha</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={newAd.title}
                                    onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Turi</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newAd.ad_type}
                                        onChange={e => setNewAd({ ...newAd, ad_type: e.target.value })}
                                    >
                                        <option value="banner">Banner</option>
                                        <option value="splash">Splash (Kirish)</option>
                                        <option value="inline">Inline (Orasida)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Media Turi</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
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
                                    <label className="block text-sm font-medium mb-1">O'rni (Position)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newAd.position}
                                        onChange={e => setNewAd({ ...newAd, position: e.target.value })}
                                        placeholder="1, 2, 3..."
                                    />
                                </div>
                            )}

                            {newAd.ad_type === 'splash' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Davomiyligi (sekund)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2"
                                        value={newAd.duration}
                                        onChange={e => setNewAd({ ...newAd, duration: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Boshlanish Vaqti</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded-lg p-2"
                                        value={newAd.start_date}
                                        onChange={e => setNewAd({ ...newAd, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tugash Vaqti</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded-lg p-2"
                                        value={newAd.end_date}
                                        onChange={e => setNewAd({ ...newAd, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Havola (Link URL)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={newAd.link_url}
                                    onChange={e => setNewAd({ ...newAd, link_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Fayl</label>
                                <input
                                    type="file"
                                    className="w-full border rounded-lg p-2"
                                    onChange={e => setNewAd({ ...newAd, file: e.target.files[0] })}
                                    required
                                    accept="image/*,video/*"
                                />
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} type="button">
                                    Bekor qilish
                                </Button>
                                <Button type="submit">
                                    Saqlash
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
