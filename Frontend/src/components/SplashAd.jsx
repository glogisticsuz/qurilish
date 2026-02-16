import React, { useState, useEffect } from 'react';
import { Modal } from './UIComponents';

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

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        // Fetch splash ad
        fetch(`${API_URL}/ads/splash`)
            .then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    setAd(data);
                    // Set duration from backend or default to 5
                    setCountdown(data.duration || 5);
                    // If skippable, allow close immediately, otherwise wait
                    setCanClose(data.is_skippable || false);

                    // Track view
                    fetch(`${API_URL}/ads/${data.id}/view`, { method: 'POST' });
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

            // Auto close if user hasn't interacted? Maybe not, better let them close it manually or click it.
            // But usually splash ads auto-close or show "Close" button.
        }
    }, [countdown]);

    const handleClick = () => {
        if (ad && ad.link_url) {
            // Track click
            fetch(`${API_URL}/ads/${ad.id}/click`, { method: 'POST' });
            window.open(ad.link_url, '_blank');
        }
    };

    const handleClose = () => {
        sessionStorage.setItem('splash_shown', 'true');
        onClose();
    };

    if (!ad) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
            <div className="relative max-w-4xl w-full mx-4">
                {/* Close Button */}
                {canClose && (
                    <button
                        onClick={handleClose}
                        className="absolute -top-12 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Countdown */}
                {!canClose && (
                    <div className="absolute -top-12 right-0 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-900">
                        {countdown} soniya...
                    </div>
                )}

                {/* Ad Image */}
                {/* Ad Content (Image or Video) */}
                <div
                    onClick={handleClick}
                    className="relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl bg-white"
                >
                    {ad.media_type === 'video' ? (
                        <video
                            src={ad.image_url}
                            className="w-full h-auto max-h-[80vh]"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-auto max-h-[80vh] object-cover"
                        />
                    )}

                    {ad.link_url && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-gray-900 font-bold text-lg">{ad.title}</p>
                            <p className="text-purple-600 text-sm">Batafsil ma'lumot uchun bosing →</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SplashAd;
