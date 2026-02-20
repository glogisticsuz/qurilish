import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/UIComponents';
import { authApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('pro');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Auto-redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.login(phone, role);
            setStep(2);
        } catch (err) {
            alert(t('error') || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.verify(phone, otp);
            localStorage.setItem('token', res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            alert("Kod noto'g'ri");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] transition-colors duration-300 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-white font-bold text-3xl">M</span>
                        </div>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            Mega<span className="text-purple-600">Stroy</span>
                        </span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl dark:shadow-none border border-gray-200 dark:border-white/5 p-8 transition-all duration-300">
                    {step === 1 ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {t('whoAreYou')}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'pro', name: t('specialist'), icon: '👷' },
                                        { id: 'supplier', name: t('equipmentOwner'), icon: '🚜' },
                                        { id: 'customer', name: t('customer'), icon: '👤' },
                                    ].map(r => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setRole(r.id)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${role === r.id
                                                ? 'bg-purple-50 dark:bg-primary/10 border-primary text-primary'
                                                : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-3xl">{r.icon}</span>
                                            <span className="text-xs font-medium text-center">{r.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('phoneNumber')}
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="+998 90 123 45 67"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Yuklanmoqda...</span>
                                    </div>
                                ) : (
                                    'Telegram orqali kirish'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-purple-50 dark:bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('enterCode')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Sizga Telegram orqali 6 xonali kod yubordik
                                </p>
                            </div>

                            <Input
                                type="text"
                                placeholder="000 000"
                                className="text-center text-2xl tracking-widest font-mono"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Tekshirilmoqda...' : t('verify')}
                            </Button>

                            {/* Telegram Bot Link */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                <p className="text-xs text-gray-600 mb-2 text-center">
                                    Kod kelmadimi?
                                </p>
                                <a
                                    href="https://t.me/HamkorQurilish_support_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 9.58 13.9 20.37 13.75 21.01C13.68 21.31 13.43 21.36 13.2 21.21C12.79 20.94 9.17 18.55 8.71 18.25C8.42 18.06 8.39 17.79 8.68 17.58C9.5 16.99 14.15 12.82 14.21 12.69C14.28 12.56 14.13 12.49 14.02 12.56C13.88 12.65 8.54 16.03 7.85 16.47C7.4 16.76 7.15 16.71 6.84 16.63C6.18 16.46 4.96 16.07 4.15 15.82C3.69 15.68 3.65 15.35 4.3 15.11C7.62 13.86 15.54 10.65 16.45 10.27C16.8 10.12 17.15 10.03 17.15 10.43C17.15 10.63 17.03 11.23 16.64 8.8V8.8Z" />
                                    </svg>
                                    @HamkorQurilish_support_bot
                                </a>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Botga /start bosing va raqamingizni yuboring
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-gray-600 hover:text-purple-600 transition-colors"
                            >
                                ← Raqamni o'zgartirish
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-6 text-gray-400 dark:text-gray-600 text-xs">
                    © 2026 HamkorQurilish. Barcha huquqlar himoyalangan.
                </p>
            </div>
        </div>
    );
};

export default Login;
