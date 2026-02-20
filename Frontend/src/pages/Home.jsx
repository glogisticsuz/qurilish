import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe,
    HardHat,
    Truck,
    Box,
    ClipboardList,
    MapPin,
    Search,
    MessageSquare,
    User,
    Home as HomeIcon,
    Headset,
    ShieldCheck,
    X,
    ChevronDown,
    CheckCircle
} from 'lucide-react';
import { Button, ProductCard, Spinner } from '../components/UIComponents';
import SplashAd from '../components/SplashAd';
import BannerCarousel from '../components/BannerCarousel';
import InlineAd from '../components/InlineAd';
import api, { profileApi } from '../api/api';
import { useTranslation } from '../utils/i18n';
import { regions } from '../utils/regions';

const Home = () => {
    const [showSplashAd, setShowSplashAd] = useState(true);
    const [activeCategory, setActiveCategory] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [inlineAds, setInlineAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(regions[0]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const navigate = useNavigate();
    const { t, lang } = useTranslation();

    const categories = [
        { id: 0, name: 'Barchasi', icon: Globe },
        { id: 1, name: 'Ustalar', icon: HardHat },
        { id: 2, name: 'Texnika', icon: Truck },
        { id: 3, name: 'Materiallar', icon: Box },
        { id: 4, name: 'Prorablar', icon: ClipboardList },
        { id: 5, name: 'Ish e\'lonlari', icon: MapPin },
    ];

    useEffect(() => {
        fetchItems();
        fetchInlineAds();
    }, [activeCategory]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await profileApi.getAllItems(activeCategory === 0 ? null : activeCategory);
            setItems(res.data || []);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInlineAds = async () => {
        try {
            const res = await api.get('/ads/inline');
            setInlineAds(res.data || []);
        } catch (error) {
            console.error("Error fetching inline ads:", error);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = selectedRegion.id === 'all' ||
            item.profile?.region?.toLowerCase().includes(selectedRegion.name.replace(' viloyati', '').replace(' shahri', '').toLowerCase()) ||
            item.location?.toLowerCase().includes(selectedRegion.name.replace(' viloyati', '').replace(' shahri', '').toLowerCase());

        const matchesDistrict = !selectedDistrict ||
            item.location?.toLowerCase().includes(selectedDistrict.toLowerCase());

        return matchesSearch && matchesRegion && matchesDistrict;
    });

    const getInterleavedItems = () => {
        if (!inlineAds.length) return filteredItems.map(item => ({ type: 'product', data: item }));
        const result = [];
        let adIndex = 0;
        filteredItems.forEach((item, index) => {
            result.push({ type: 'product', data: item });
            if ((index + 1) % 10 === 0) {
                result.push({ type: 'ad', data: inlineAds[adIndex % inlineAds.length] });
                adIndex++;
            }
        });
        return result;
    };

    const displayItems = getInterleavedItems();

    return (
        <div className="min-h-screen bg-[#ffffff] pb-24">
            {showSplashAd && <SplashAd onClose={() => setShowSplashAd(false)} />}

            {/* iOS Style Hero Section */}
            <div className="bg-[#7c3aed] pt-8 pb-12 px-6 rounded-b-[32px] shadow-lg transition-all duration-300">
                {isSearchOpen ? (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl flex items-center px-4 py-3 border border-white/20 shadow-inner">
                                <Search size={20} className="text-purple-100 mr-2" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Mutaxassis yoki xizmatni izlang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white placeholder:text-purple-200 w-full font-medium"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-purple-200 hover:text-white">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSelectedRegion(regions[0]);
                                    setSelectedDistrict(null);
                                    setSearchQuery('');
                                }}
                                className="text-white font-black text-sm uppercase tracking-widest px-2"
                            >
                                Yo'q
                            </button>
                        </div>

                        {/* Regional Selector Trigger */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsRegionModalOpen(true)}
                                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center justify-between group active:scale-95 transition-all outline-none"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <MapPin size={16} className="text-purple-200" />
                                    <span className="text-white text-[13px] font-bold truncate">
                                        {selectedDistrict ? `${selectedRegion.name.split(' ')[0]}, ${selectedDistrict}` : selectedRegion.name}
                                    </span>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                    <ChevronDown size={14} className="text-purple-100" />
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-6 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="HamkorQurilish" className="w-12 h-12 rounded-xl border border-white/20 shadow-sm" />
                            <div>
                                <h1 className="text-[24px] font-black text-white leading-tight">HamkorQurilish</h1>
                                <p className="text-purple-200 text-[12px]">Barcha qurilish xizmatlari bir joyda</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90"
                        >
                            <Search size={24} />
                        </button>
                    </div>
                )}

                {/* Banner Carousel */}
                <div className="mb-4">
                    <BannerCarousel />
                </div>
            </div>

            {/* Hidden the old static search bar since we have expanding one now */}

            {/* Categories Scroll */}
            <div className="overflow-x-auto scrollbar-hide py-6">
                <div className="flex gap-3 px-6">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all border ${isActive
                                    ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md shadow-purple-200'
                                    : 'bg-white text-gray-600 border-gray-100 hover:border-purple-200'
                                    }`}
                            >
                                <Icon size={18} color={isActive ? '#fff' : '#7c3aed'} />
                                <span className="text-[14px]">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Section Title */}
            <div className="px-6 mb-4 flex justify-between items-center">
                <h2 className="text-[20px] font-black text-gray-900">
                    {searchQuery ? "Qidiruv natijalari" : "Oxirgi e'lonlar"}
                </h2>
                <span className="text-gray-400 text-sm font-medium">{displayItems.length} ta</span>
            </div>

            {/* Grid */}
            <div className="px-6">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <div className="text-6xl mb-4 opacity-50">📦</div>
                        <p className="text-gray-400 font-bold">Ma'lumot topilmadi</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {displayItems.map((item, index) => (
                            item.type === 'product' ? (
                                <ProductCard
                                    key={item.data.id}
                                    image={item.data.image_url1}
                                    title={item.data.title}
                                    price={item.data.price ? `${item.data.price.toLocaleString()} so'm` : 'Kelishilgan'}
                                    location={item.data.location || item.data.profile?.region}
                                    ownerName={item.data.profile?.full_name}
                                    isVerified={item.data.profile?.is_verified}
                                    onClick={() => navigate(`/profile/${item.data.profile?.user_id}`)}
                                />
                            ) : (
                                <InlineAd key={`ad-${index}`} ad={item.data} />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Support Button */}
            <a
                href="https://t.me/Megastroy_support_user_bot"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-24 right-6 w-14 h-14 bg-[#7c3aed] text-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform z-40"
            >
                <Headset size={28} />
            </a>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center py-3 px-2 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-[#7c3aed] transition-all active:scale-90"
                >
                    <div className="relative">
                        <HomeIcon size={24} />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#7c3aed] rounded-full shadow-lg shadow-[#7c3aed]/40" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">Asosiy</span>
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <ClipboardList size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Kabinet</span>
                </button>
                <button
                    onClick={() => setIsSearchOpen(true)}
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
            {/* Region Selection Modal */}
            {isRegionModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Hududni tanlang</h3>
                            <button onClick={() => setIsRegionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {regions.map(region => (
                                <button
                                    key={region.id}
                                    onClick={() => {
                                        setSelectedRegion(region);
                                        if (region.id === 'all') {
                                            setSelectedDistrict(null);
                                            setIsRegionModalOpen(false);
                                        } else {
                                            setIsRegionModalOpen(false);
                                            setIsDistrictModalOpen(true);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${selectedRegion.id === region.id
                                        ? 'bg-purple-50 text-[#7c3aed]'
                                        : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span className="font-bold">{region.name}</span>
                                    {selectedRegion.id === region.id && <CheckCircle size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* District Selection Modal */}
            {isDistrictModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <button
                                    onClick={() => {
                                        setIsDistrictModalOpen(false);
                                        setIsRegionModalOpen(true);
                                    }}
                                    className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest flex items-center gap-1 mb-1"
                                >
                                    <ChevronDown size={12} className="rotate-90" />
                                    Orqaga
                                </button>
                                <h3 className="text-xl font-black text-gray-900">{selectedRegion.name}</h3>
                            </div>
                            <button onClick={() => setIsDistrictModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            <button
                                onClick={() => {
                                    setSelectedDistrict(null);
                                    setIsDistrictModalOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${!selectedDistrict
                                    ? 'bg-purple-50 text-[#7c3aed]'
                                    : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <span className="font-bold">Barcha tumanlar</span>
                                {!selectedDistrict && <CheckCircle size={20} />}
                            </button>
                            {selectedRegion.districts.map(district => (
                                <button
                                    key={district}
                                    onClick={() => {
                                        setSelectedDistrict(district);
                                        setIsDistrictModalOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${selectedDistrict === district
                                        ? 'bg-purple-50 text-[#7c3aed]'
                                        : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span className="font-bold">{district}</span>
                                    {selectedDistrict === district && <CheckCircle size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
