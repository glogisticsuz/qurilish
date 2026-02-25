import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Star, Send, ChevronRight, CheckCircle, Eye } from 'lucide-react';
import { chatApi, reviewApi, profileApi } from '../api/api';

/* ============================================
   UZUM-STYLE UI COMPONENTS
   ============================================ */

// Button Component
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5',
        secondary: 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300',
        outline: 'bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
        danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Input Component
export const Input = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white dark:focus:bg-white/10 placeholder:text-gray-400 ${className}`}
            {...props}
        />
    );
};

// Card Component
export const Card = ({ children, hover = false, className = '', ...props }) => {
    return (
        <div
            className={`bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-white/5 p-6 transition-all duration-300 ${hover ? 'hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 cursor-pointer' : 'shadow-sm'
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Badge Component
export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-purple-50 text-purple-700 border border-purple-100',
        success: 'bg-green-50 text-green-700 border border-green-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
        gray: 'bg-gray-50 text-gray-600 border border-gray-100',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Language Selector Component
export const LanguageSelector = ({ currentLang, onChange }) => {
    const languages = [
        { code: 'uz', label: 'O\'zbekcha', flag: '🇺🇿' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    ];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white">
                <span className="text-lg">{languages.find(l => l.code === currentLang)?.flag}</span>
                <span className="text-sm font-medium hidden md:block">
                    {languages.find(l => l.code === currentLang)?.label}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-lg border border-gray-200 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => onChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLang === lang.code ? 'bg-purple-50 dark:bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Theme Toggle Component
export const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
            title={theme === 'dark' ? "Yorug' rejim" : "Tungi rejim"}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
};

// Product Card (iOS-style)
export const ProductCard = ({ image, title, price, location, ownerName, isVerified, onClick, onImageClick, onProfileClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 cursor-pointer hover:shadow-xl group"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                    src={image}
                    alt={title}
                    onClick={(e) => {
                        if (onImageClick) {
                            e.stopPropagation();
                            onImageClick();
                        }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isVerified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="text-[14px] font-bold text-purple-600 mb-1">{price}</p>
                <h3 className="text-[15px] font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div
                        className="flex items-center gap-2 group/profile cursor-pointer"
                        onClick={(e) => {
                            if (onProfileClick) {
                                e.stopPropagation();
                                onProfileClick();
                            }
                        }}
                    >
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-purple-600 group-hover/profile:bg-purple-100 transition-colors">
                            {ownerName ? ownerName[0].toUpperCase() : '?'}
                        </div>
                        <span className="text-[12px] font-medium text-gray-600 truncate max-w-[80px] group-hover/profile:text-purple-600 transition-colors">
                            {ownerName || 'Foydalanuvchi'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[11px] font-medium">{location || 'O\'zbekiston'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Fullscreen Image Modal
export const FullscreenImageModal = ({ isOpen, onClose, image }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <img
                src={image}
                alt="Fullscreen"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// Ad Detail Modal
export const AdDetailModal = ({ isOpen, onClose, item, onImageClick }) => {
    const [viewIncremented, setViewIncremented] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && item?.id && !viewIncremented) {
            fetch(`${import.meta.env.VITE_API_URL || 'https://hamkorqurilish.uz'}/api/items/${item.id}/view`, { method: 'POST' })
                .then(() => setViewIncremented(true))
                .catch(err => console.error("View increment error:", err));
        }
    }, [isOpen, item?.id]);

    if (!isOpen || !item) return null;

    // Support for multiple images from item data
    const images = [item.image_url1, item.image_url2, item.image_url3, item.image_url4, item.image_url5].filter(Boolean);

    return (
        <div className="fixed inset-0 z-[101] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>
            <div className="relative bg-white w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-300">
                <div className="sticky top-0 z-10 flex justify-end p-4 pointer-events-none">
                    <button
                        onClick={onClose}
                        className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    >
                        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 pt-0 sm:p-8 sm:pt-4">
                    {/* Image Gallery */}
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 -mx-2 px-2">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => onImageClick(img)}
                                className="flex-shrink-0 w-64 h-64 sm:w-80 sm:h-80 bg-gray-50 rounded-[24px] overflow-hidden cursor-pointer hover:ring-4 hover:ring-purple-500/20 transition-all border border-gray-100"
                            >
                                <img src={img} alt={`${item.title} ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[11px] font-black uppercase tracking-wider">Aktiv elon</span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[11px] font-black uppercase tracking-wider">{item.location}</span>
                                    <div className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <Eye size={12} className="text-gray-400" />
                                        <span>{item.views_count || 0} marta ko'rildi</span>
                                    </div>
                                </div>
                                <h2 className="text-[24px] sm:text-[32px] font-black text-gray-900 leading-tight">
                                    {item.title}
                                </h2>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <Button
                                    onClick={() => (window.location.href = `tel:${item.phone || item.profile?.user?.phone}`)}
                                    className="w-full h-14 rounded-2xl shadow-lg shadow-green-500/20"
                                    variant="success"
                                >
                                    <Phone size={20} />
                                    <span>BOG'LANISH</span>
                                </Button>
                                <Button
                                    onClick={() => {
                                        const targetUserId = item.userId || item.profile?.user_id || item.profile_id;
                                        if (targetUserId) window.location.href = `/chat/${targetUserId}`;
                                    }}
                                    className="w-full h-14 rounded-2xl shadow-lg shadow-purple-500/20"
                                >
                                    <MessageSquare size={20} />
                                    <span>XABAR YOZISH</span>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-[24px] border border-purple-100">
                            <p className="text-purple-600 font-black text-[28px]">
                                {item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan'}
                                <span className="text-purple-400 text-sm font-black ml-2 uppercase">/ {item.price_type}</span>
                            </p>
                        </div>

                        <div>
                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Ba'tafsil malumot</h3>
                            <p className="text-gray-700 text-[17px] leading-relaxed font-medium whitespace-pre-wrap">
                                {item.description || "Hozircha tavsif kiritilmagan."}
                            </p>
                        </div>

                        {/* Owner Info */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-purple-600 border border-gray-100 shadow-sm overflow-hidden">
                                        {item.profile?.avatar_url ? (
                                            <img src={item.profile.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            item.profile?.full_name ? item.profile.full_name[0].toUpperCase() : '?'
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">E'lon egasi</p>
                                        <h4 className="text-[18px] font-black text-gray-900 italic">{item.profile?.full_name || 'Foydalanuvchi'}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                <span className="text-[11px] font-black text-gray-900">{item.profile?.rating || '0'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                                                <Eye size={12} className="text-gray-400" />
                                                <span className="text-[11px] font-black text-gray-400">{item.views_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => (window.location.href = `/profile/${item.profile?.user_id}`)}
                                    className="h-10 px-4 rounded-xl text-purple-600 bg-white border border-purple-100 hover:bg-purple-50 transition-colors shadow-sm"
                                    variant="secondary"
                                    size="sm"
                                >
                                    PROFILNI KO'RISH
                                </Button>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <ReviewsSection userId={item.userId || item.profile?.user_id || item.profile_id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reviews Section Component
const ReviewsSection = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ stars: 5, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userId) fetchReviews();
    }, [userId]);

    const fetchReviews = async () => {
        try {
            const res = await reviewApi.getReviews(userId);
            setReviews(res.data || []);
        } catch (err) {
            console.error("Reviews fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem('token')) return alert("Sharh qoldirish uchun tizimga kiring");
        setSubmitting(true);
        try {
            await reviewApi.addReview(userId, newReview);
            setSuccess(true);
            setNewReview({ stars: 5, text: '' });
            fetchReviews();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err.response?.data?.detail || "Xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pt-8 border-t border-gray-100">
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Mijozlar sharhlari ({reviews.length})</h3>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-[28px] border border-gray-100">
                <p className="text-[13px] font-black text-gray-900 uppercase tracking-tight mb-4 text-center">Ximat sifatini baholang</p>
                <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, stars: star })}
                            className="transition-transform active:scale-90"
                        >
                            <Star
                                size={32}
                                className={star <= newReview.stars ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                            />
                        </button>
                    ))}
                </div>
                <textarea
                    placeholder="O'z fikringizni qoldiring..."
                    className="w-full p-4 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 outline-none resize-none mb-4"
                    rows={3}
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                />
                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl"
                    disabled={submitting || !newReview.text}
                >
                    {success ? <><CheckCircle size={18} /><span>YUBORILDI</span></> : (submitting ? 'YUBORILMOQDA...' : 'SHARH QOLDIRISH')}
                </Button>
            </form>

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-4"><Spinner sm /></div>
                ) : reviews.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm font-medium uppercase tracking-widest">Hozircha sharhlar yo'q</p>
                ) : (
                    reviews.map((rev, i) => (
                        <div key={i} className="flex gap-4 animate-in fade-in duration-500">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex-shrink-0 flex items-center justify-center text-purple-600 font-black text-sm">
                                {rev.from_user?.phone?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-black text-gray-900">{rev.from_user?.phone || 'Foydalanuvchi'}</h4>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} size={10} className={j < rev.stars ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{rev.text}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Loading Spinner
export const Spinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={`${sizes[size]} border-gray-200 border-t-purple-600 rounded-full animate-spin`}></div>
    );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// Kept for backward compatibility
export const GlassCard = Card;
