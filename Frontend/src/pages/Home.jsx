import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, ProductCard, LanguageSelector, Spinner, ThemeToggle } from '../components/UIComponents';
import SplashAd from '../components/SplashAd';
import BannerCarousel from '../components/BannerCarousel';
import InlineAd from '../components/InlineAd';
import { profileApi } from '../api/api';
import { useTranslation } from '../utils/i18n';
import { useTheme } from '../hooks/useTheme';

const Home = () => {
    const [showSplashAd, setShowSplashAd] = useState(true);
    const [activeCategory, setActiveCategory] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [inlineAds, setInlineAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t, lang, setLanguage } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const categories = [
        { id: 0, name: t('all'), icon: '🌐' },
        { id: 1, name: t('specialists'), icon: '👷' },
        { id: 2, name: t('equipment'), icon: '🚜' },
        { id: 3, name: t('materials'), icon: '🧱' },
        { id: 4, name: t('foremen'), icon: '📋' },
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
            const res = await fetch(`${API_URL}/ads/inline`);
            const data = await res.json();
            setInlineAds(data || []);
        } catch (error) {
            console.error("Error fetching inline ads:", error);
        }
    };

    const filteredItems = items.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInterleavedItems = () => {
        if (!inlineAds.length) return filteredItems.map(item => ({ type: 'product', data: item }));

        const result = [];
        let adIndex = 0;

        filteredItems.forEach((item, index) => {
            result.push({ type: 'product', data: item });
            // Insert ad after every 10 items
            if ((index + 1) % 10 === 0) {
                result.push({ type: 'ad', data: inlineAds[adIndex % inlineAds.length] });
                adIndex++;
            }
        });

        return result;
    };

    const displayItems = getInterleavedItems();

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-300">
            {/* Splash Ad */}
            {showSplashAd && <SplashAd onClose={() => setShowSplashAd(false)} />}

            {/* Navbar */}
            <nav className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mega<span className="text-purple-600">Stroy</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <LanguageSelector currentLang={lang} onChange={setLanguage} />

                        {localStorage.getItem('token') ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate('/messages')}
                                    className="hidden md:flex"
                                >
                                    💬 {t('messages')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    {t('dashboard')}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/login')}
                            >
                                {t('login')}
                            </Button>
                        )}

                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                        >
                            + {t('postAd')}
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {lang === 'uz' && 'Qurilish Xizmatlari Platformasi'}
                        {lang === 'en' && 'Construction Services Platform'}
                        {lang === 'ru' && 'Платформа Строительных Услуг'}
                    </h1>
                    <p className="text-purple-100 text-lg mb-8">
                        {lang === 'uz' && 'Ustalar, texnika va qurilish mollari bir joyda'}
                        {lang === 'en' && 'Specialists, equipment and materials in one place'}
                        {lang === 'ru' && 'Специалисты, техника и материалы в одном месте'}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Banner Carousel */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <BannerCarousel />
            </div>

            {/* Items Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg">
                            {lang === 'uz' && 'Hozircha e\'lonlar yo\'q'}
                            {lang === 'en' && 'No listings yet'}
                            {lang === 'ru' && 'Пока нет объявлений'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayItems.map((item, index) => (
                            item.type === 'product' ? (
                                <ProductCard
                                    key={item.data.id}
                                    image={item.data.image_url}
                                    title={item.data.title}
                                    price={item.data.price ? `${item.data.price.toLocaleString()} so'm` : t('available')}
                                    location={item.data.profile?.region}
                                    verified={item.data.profile?.is_verified}
                                    onClick={() => navigate(`/profile/${item.data.profile?.user_id}`)}
                                />
                            ) : (
                                <InlineAd key={`ad-${index}`} ad={item.data} />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
                <div className="flex justify-around items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex flex-col items-center gap-1 text-purple-600"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span className="text-xs font-medium">{t('home')}</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex flex-col items-center gap-1 text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-xs font-medium">{t('dashboard')}</span>
                    </button>
                    <button
                        onClick={() => navigate(localStorage.getItem('token') ? '/messages' : '/login')}
                        className="flex flex-col items-center gap-1 text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs font-medium">{t('messages')}</span>
                    </button>
                    <button
                        onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/login')}
                        className="flex flex-col items-center gap-1 text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium">{t('profile')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
