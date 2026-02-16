import React from 'react';

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

// Product Card (Uzum-style)
export const ProductCard = ({ image, title, price, location, verified, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                {verified && (
                    <div className="absolute top-2 right-2">
                        <Badge variant="success">✓ Tasdiqlangan</Badge>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {title}
                </h3>
                {location && (
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-purple-600">{price}</p>
                </div>
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
