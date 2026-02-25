import React, { useState, useEffect } from 'react';
import { Modal } from './UIComponents';
import api from '../api/api';
import { X, ExternalLink, Clock } from 'lucide-react';

const SplashAd = ({ onClose }) => {
    const [ad, setAd] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        // Check if splash ad was shown in this session
        const splashShown = sessionStorage.getItem('splash_shown');
        if (splashShown) {
            onClose();
            return;
        }

        // Fetch splash ad
        api.get('/api/ads/splash')
            .then(res => {
                const data = res.data;
                if (data && data.id) {
                    setAd(data);
                    // Set duration from backend or default to 5
                    setCountdown(data.duration || 5);
                    // If skippable, allow close immediately, otherwise wait
                    setCanClose(data.is_skippable || false);

                    // Track view
                    api.post(`/api/ads/${data.id}/view`, {}).catch(() => { });
                } else {
                    onClose();
                }
            })
            .catch(() => onClose());
    }, [onClose]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanClose(true); // Always allow close after countdown
        }
    }, [countdown]);

    const handleClick = () => {
        if (ad && ad.link_url) {
            // Track click
            api.post(`/api/ads/${ad.id}/click`, {}).catch(() => { });
            window.open(ad.link_url, '_blank');
        }
    };

    const handleClose = (e) => {
        e.stopPropagation();
        sessionStorage.setItem('splash_shown', 'true');
        onClose();
    };

    if (!ad) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-700">
            <div className="relative max-w-4xl w-full mx-4 animate-in zoom-in-95 duration-500 delay-150 fill-mode-both">

                {/* Header Controls */}
                <div className="absolute -top-16 left-0 right-0 flex justify-between items-center px-2">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-white text-xs font-black uppercase tracking-widest">Premium Ad</span>
                    </div>

                    <div className="flex gap-3">
                        {!canClose && (
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 text-white">
                                <Clock size={14} className="animate-spin-slow" />
                                <span className="text-sm font-bold">{countdown}s</span>
                            </div>
                        )}

                        {canClose && (
                            <button
                                onClick={handleClose}
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-purple-500 hover:text-white transition-all transform hover:rotate-90 duration-300 shadow-2xl shadow-white/10 group"
                            >
                                <X size={24} className="group-hover:scale-110" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Ad Container */}
                <div
                    onClick={handleClick}
                    className="relative group rounded-[32px] overflow-hidden cursor-pointer shadow-[0_40px_100px_rgba(0,0,0,0.5)] bg-gray-900 border border-white/5"
                >
                    {ad.media_type === 'video' ? (
                        <video
                            src={ad.image_url}
                            className="w-full h-auto max-h-[75vh] object-contain transition-transform duration-1000 group-hover:scale-105"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-auto max-h-[75vh] object-contain transition-transform duration-1000 group-hover:scale-105"
                        />
                    )}

                    {/* Content Overlay */}
                    <div className="absolute inset-x-4 bottom-4 p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl group/btn flex flex-col md:flex-row md:items-center justify-between gap-4 translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div>
                            <h2 className="text-white font-black text-xl md:text-2xl drop-shadow-lg mb-1">{ad.title}</h2>
                            <p className="text-white/60 text-sm font-medium">Batafsil ma'lumot olish uchun bosing</p>
                        </div>
                        <div className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold transition-all shadow-xl shadow-purple-600/30 group-hover/btn:scale-105">
                            <span>Ko'rish</span>
                            <ExternalLink size={20} />
                        </div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -z-10 -top-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -z-10 -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>
        </div>
    );
};

export default SplashAd;
