import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerCarousel = () => {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Min swipe distance in pixels
    const minSwipeDistance = 50;

    useEffect(() => {
        fetch(`${API_URL}/ads/banners`)
            .then(res => res.json())
            .then(data => {
                setAds(data || []);
                if (data && data.length > 0) {
                    fetch(`${API_URL}/ads/${data[0].id}/view`, { method: 'POST' });
                }
            })
            .catch(err => console.error('Banner fetch error:', err));
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % ads.length;
            setCurrentIndex(nextIndex);
            fetch(`${API_URL}/ads/${ads[nextIndex].id}/view`, { method: 'POST' });
        }, 5000);

        return () => clearInterval(interval);
    }, [ads, currentIndex]);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrentIndex((currentIndex + 1) % ads.length);
        } else if (isRightSwipe) {
            setCurrentIndex((currentIndex - 1 + ads.length) % ads.length);
        }
    };

    const handleBannerClick = (banner) => {
        if (banner.link_url) {
            fetch(`${API_URL}/ads/${banner.id}/click`, { method: 'POST' });
            window.open(banner.link_url, '_blank');
        }
    };

    if (ads.length === 0) return null;

    const currentBanner = ads[currentIndex];

    return (
        <div
            className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100 rounded-[24px] overflow-hidden group shadow-lg"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {currentBanner.media_type === 'video' ? (
                <video
                    src={currentBanner.image_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            ) : (
                <img
                    src={currentBanner.image_url}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover"
                />
            )}

            {/* Content Overlay */}
            <div
                onClick={() => handleBannerClick(currentBanner)}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 cursor-pointer"
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/20">
                        Reklama
                    </span>
                </div>
                <h3 className="text-white text-lg md:text-2xl font-black leading-tight drop-shadow-md">
                    {currentBanner.title}
                </h3>
            </div>

            {/* Navigation Buttons */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + ads.length) % ads.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center text-white hidden group-hover:flex transition-all z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % ads.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center text-white hidden group-hover:flex transition-all z-10"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots */}
            {ads.length > 1 && (
                <div className="absolute bottom-4 left-6 flex gap-1.5">
                    {ads.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCarousel;
