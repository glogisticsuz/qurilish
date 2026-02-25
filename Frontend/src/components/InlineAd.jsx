import React, { useEffect, useRef } from 'react';
import api from '../api/api';
import { ExternalLink, ShoppingBag } from 'lucide-react';

const InlineAd = ({ ad }) => {
    const adRef = useRef(null);
    const viewTracked = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !viewTracked.current && ad?.id) {
                    viewTracked.current = true;
                    // Track view
                    api.post(`/api/ads/${ad.id}/view`, {}).catch(() => { });
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
    }, [ad.id]);

    const handleClick = () => {
        if (ad.link_url) {
            api.post(`/api/ads/${ad.id}/click`, {}).catch(() => { });
            window.open(ad.link_url, '_blank');
        }
    };

    return (
        <div
            ref={adRef}
            onClick={handleClick}
            className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-500 cursor-pointer hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:-translate-y-2 active:scale-95"
        >
            {/* Badge */}
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/70 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Reklama
                    </span>
                </div>
            </div>

            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {ad.media_type === 'video' ? (
                    <video
                        src={ad.image_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                )}

                {/* Floating Action */}
                <div className="absolute bottom-4 right-4 z-20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                        <ExternalLink size={20} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem] group-hover:text-purple-600 transition-colors duration-300">
                    {ad.title}
                </h3>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-sm tracking-tight">
                        Batafsil ma'lumot
                    </span>
                    <ShoppingBag size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
            </div>

            {/* Glass decoration */}
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
        </div>
    );
};

export default InlineAd;
