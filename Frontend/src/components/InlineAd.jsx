import React, { useEffect, useRef } from 'react';

const InlineAd = ({ ad }) => {
    const adRef = useRef(null);
    const viewTracked = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !viewTracked.current) {
                    viewTracked.current = true;
                    // Track view
                    fetch(`${API_URL}/ads/${ad.id}/view`, { method: 'POST' });
                }
            },
            { threshold: 0.5 }
        );

        if (adRef.current) {
            observer.observe(adRef.current);
        }

        return () => {
            if (adRef.current) {
                observer.unobserve(adRef.current);
            }
        };
    }, [ad.id, API_URL]); // Added API_URL to dependencies

    const handleClick = () => {
        if (ad.link_url) {
            fetch(`${API_URL}/ads/${ad.id}/click`, { method: 'POST' });
            window.open(ad.link_url, '_blank');
        }
    };

    return (
        <div
            ref={adRef}
            onClick={handleClick}
            className="bg-purple-50 dark:bg-purple-900/10 rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 relative group"
        >
            <div className="absolute top-2 right-2 z-10">
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                    Reklama
                </span>
            </div>

            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {ad.media_type === 'video' ? (
                    <video
                        src={ad.image_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                    {ad.title}
                </h3>
                <p className="text-purple-600 font-medium text-sm flex items-center gap-1">
                    Batafsil ko'rish
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </p>
            </div>
        </div>
    );
};

export default InlineAd;
