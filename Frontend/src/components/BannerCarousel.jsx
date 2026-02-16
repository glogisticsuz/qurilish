import React, { useState, useEffect } from 'react';
import { Button } from './UIComponents';

const BannerCarousel = () => {
    const [ads, setAds] = useState([]); // Renamed from banners to ads
    const [currentIndex, setCurrentIndex] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        // Fetch banner ads
        fetch(`${API_URL}/ads/banners`)
            .then(res => res.json())
            .then(data => {
                setAds(data); // Changed from setBanners to setAds
                if (data.length > 0) {
                    // Track view for first banner
                    fetch(`${API_URL}/ads/${data[0].id}/view`, { method: 'POST' });
                }
            })
            .catch(err => console.error('Banner fetch error:', err));
    }, []);

    useEffect(() => {
        if (ads.length === 0) return; // Changed from banners.length to ads.length

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length); // Changed from banners.length to ads.length
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [ads]); // Changed from banners to ads

    // Track view when index changes - This useEffect is replaced by nextSlide/prevSlide logic in the instruction,
    // but the instruction snippet doesn't fully replace it in a way that makes sense for auto-play.
    // Keeping the original useEffect for auto-play view tracking, and adding the new functions.
    useEffect(() => {
        if (ads.length > 0) { // Changed from banners.length to ads.length
            const currentBanner = ads[currentIndex]; // Changed from banners to ads
            fetch(`${API_URL}/ads/${currentBanner.id}/view`, { method: 'POST' });
        }
    }, [currentIndex, ads]); // Changed from banners to ads

    // New functions from the instruction, assuming they are for manual navigation if implemented later
    const nextSlide = () => {
        const nextIndex = (currentIndex + 1) % ads.length;
        setCurrentIndex(nextIndex);
        const nextBanner = ads[nextIndex];
        fetch(`${API_URL}/ads/${nextBanner.id}/view`, { method: 'POST' });
    };

    const prevSlide = () => {
        const prevIndex = (currentIndex - 1 + ads.length) % ads.length;
        setCurrentIndex(prevIndex);
        const prevBanner = ads[prevIndex];
        fetch(`${API_URL}/ads/${prevBanner.id}/view`, { method: 'POST' });
    };

    const handleBannerClick = (banner) => { // Renamed from handleClick to handleBannerClick
        if (banner.link_url) {
            fetch(`${API_URL}/ads/${banner.id}/click`, { method: 'POST' });
            window.open(banner.link_url, '_blank');
        }
    };

    if (ads.length === 0) return null; // Changed from banners.length to ads.length

    // Helper to determine position class
    const getPositionClass = (index) => {
        if (banners.length === 1) return 'left-1/2 -translate-x-1/2 z-20 scale-100 opacity-100';

        const diff = (index - currentIndex + banners.length) % banners.length;

        if (diff === 0) return 'left-1/2 -translate-x-1/2 z-20 scale-100 opacity-100'; // Center
        if (diff === 1) return 'left-[85%] -translate-x-1/2 z-10 scale-75 opacity-70'; // Right
        if (diff === banners.length - 1) return 'left-[15%] -translate-x-1/2 z-10 scale-75 opacity-70'; // Left

        return 'left-1/2 -translate-x-1/2 scale-50 opacity-0 z-0 hidden'; // Others
    };

    return (
        <div className="relative w-full h-48 md:h-80 overflow-hidden flex items-center justify-center my-6">
            <div className="relative w-full h-full max-w-6xl mx-auto">
                {banners.map((banner, index) => {
                    const positionClass = getPositionClass(index);

                    return (
                        <div
                            key={banner.id}
                            onClick={() => handleClick(banner)}
                            className={`absolute top-0 transition-all duration-700 ease-in-out cursor-pointer w-full md:w-3/4 h-full rounded-2xl overflow-hidden shadow-2xl ${positionClass}`}
                            style={{
                                width: '70%', // Force width for the cards
                                maxWidth: '800px'
                            }}
                        >
                            {banner.media_type === 'video' ? (
                                <video
                                    src={banner.image_url}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={banner.image_url}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end h-1/2">
                                <h3 className="text-white font-bold text-lg md:text-2xl">{banner.title}</h3>
                                <div className="mt-2">
                                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-md">Reklama</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;
