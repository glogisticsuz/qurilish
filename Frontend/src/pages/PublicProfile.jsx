import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileApi, reviewApi, authApi } from '../api/api';
import { GlassCard, Button, Badge, Input } from '../components/UIComponents';
import { ArrowLeft, MapPin, Briefcase, MessageSquare, Star, Phone, AtSign } from 'lucide-react';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [items, setItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ stars: 5, text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const categories = [
        { id: 1, name: 'Ustalar', icon: '👷' },
        { id: 2, name: 'Texnika Ijarasi', icon: '🚜' },
        { id: 3, name: 'Qurilish Mollari', icon: '🧱' },
        { id: 4, name: 'Prorablar', icon: '📋' },
    ];

    useEffect(() => {
        fetchPublicData();
    }, [userId]);

    const fetchPublicData = async () => {
        try {
            const [profRes, itemsRes, revRes] = await Promise.all([
                profileApi.getPublicProfile(userId),
                profileApi.getUserPortfolio(userId),
                reviewApi.getReviews(userId)
            ]);
            setProfile(profRes.data);
            setItems(itemsRes.data);
            setReviews(revRes.data);

            // Check auth
            const token = localStorage.getItem('token');
            if (token) {
                const userRes = await authApi.getMe();
                setCurrentUser(userRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setSubmitting(true);
        try {
            await reviewApi.addReview(userId, newReview);
            setNewReview({ stars: 5, text: '' });
            fetchPublicData();
        } catch (err) {
            alert(err.response?.data?.detail || "Xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const rating = profile?.user?.rating || 0;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-accent/40 hover:text-primary mb-12 transition-colors uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} /> Ortga qaytish
                </button>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-40 h-40 rounded-full border-4 border-primary overflow-hidden bg-white/5 flex items-center justify-center relative">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">👤</span>
                        )}
                        {rating > 0 && (
                            <div className="absolute -bottom-2 bg-primary text-background px-3 py-1 rounded-full font-black text-sm border-2 border-background">
                                ⭐ {rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-heading font-black text-white">{profile?.full_name || 'Foydalanuvchi'}</h1>
                            {profile?.is_verified && <Badge variant="primary">Verified</Badge>}
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-accent/60 mb-6">
                            <span className="flex items-center gap-1 text-sm uppercase tracking-widest text-primary"><MapPin size={14} /> {profile?.region || 'Hudud noma\'lum'}</span>
                            <span className="flex items-center gap-1 text-sm uppercase tracking-widest text-primary"><Briefcase size={14} /> {profile?.user?.role?.toUpperCase()}</span>
                            <span className="flex items-center gap-1 text-sm uppercase tracking-widest text-primary">📦 {items.length} ta e'lon</span>
                        </div>
                        <p className="text-accent/40 max-w-2xl text-sm leading-relaxed">{profile?.bio || 'Tavsif qoldirilmagan.'}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {/* Contact Info */}
                        <GlassCard className="p-4 border-white/5 bg-white/5 mb-2">
                            {profile?.user?.phone_visible ? (
                                <div className="flex items-center gap-3 text-white mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                                        <Phone size={16} />
                                    </div>
                                    <span className="font-mono font-bold tracking-wider">{profile.user.phone}</span>
                                </div>
                            ) : (
                                <div className="text-xs text-accent/40 italic mb-2">Telefon raqam yashirilgan</div>
                            )}

                            {profile?.user?.username && (
                                <div className="flex items-center gap-3 text-white">
                                    <div className="p-2 bg-primary/20 rounded-full text-primary">
                                        <AtSign size={16} />
                                    </div>
                                    <span className="font-medium">@{profile.user.username}</span>
                                </div>
                            )}
                        </GlassCard>

                        <Button
                            variant="primary"
                            className="px-8 py-4 flex items-center gap-3"
                            onClick={() => navigate(`/chat/${userId}`)}
                        >
                            <MessageSquare size={20} /> Xabar yozish
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Catalog */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-heading font-bold flex items-center gap-4 border-l-4 border-primary pl-4 uppercase tracking-tighter">
                            Katalog / Portfolio
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {items.map(item => (
                                <GlassCard key={item.id} className="group border-white/5 overflow-hidden">
                                    <img src={item.image_url} alt={item.title} className="w-full h-56 object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                    <div className="p-6">
                                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
                                            {categories.find(c => c.id === item.category_id)?.name || 'E\'LON'}
                                        </p>
                                        <h3 className="text-xl mb-4 text-white font-bold">{item.title}</h3>
                                        <p className="text-2xl font-black text-primary italic">
                                            {item.price ? item.price.toLocaleString() : 'Kelishilgan'}
                                            {item.price && <span className="text-xs text-accent/40 uppercase ml-2">so'm / {item.price_type}</span>}
                                        </p>
                                    </div>
                                </GlassCard>
                            ))}
                            {items.length === 0 && (
                                <div className="col-span-full py-20 text-center opacity-20 uppercase tracking-[0.2em]">Hozircha e'lonlar yo'q</div>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-heading font-bold flex items-center gap-4 border-l-4 border-primary pl-4 uppercase tracking-tighter">
                            Sharhlar
                        </h2>

                        {/* Add Review */}
                        <GlassCard className="p-6 border-white/10 relative z-20">
                            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-accent/60">Sharh qoldirish</h4>
                            {currentUser?.id === parseInt(userId) ? (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-accent/40 italic">O'z profilingizga sharh qoldira olmaysiz.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAddReview} className="space-y-6 relative">
                                    <div className="flex gap-3 mb-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, stars: s })}
                                                className={`text-2xl transition-all duration-300 transform ${s <= newReview.stars ? 'text-yellow-400 scale-125' : 'text-white/10 hover:text-white/20'}`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="input-field w-full min-h-[140px] relative z-30 pointer-events-auto"
                                        placeholder={currentUser ? "Fizkingizni shu yerga yozing..." : "Sharh qoldirish uchun tizimga kiring..."}
                                        value={newReview.text}
                                        onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                        required
                                        disabled={submitting}
                                        style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] relative z-30"
                                        disabled={submitting}
                                    >
                                        {!currentUser ? "Kirish va Sharh qoldirish" : (submitting ? 'Yuborilmoqda...' : 'Sharhni yuborish')}
                                    </Button>
                                </form>
                            )}
                        </GlassCard>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.map(rev => (
                                <div key={rev.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex text-xs gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < rev.stars ? 'text-yellow-400' : 'text-white/10'}>⭐</span>
                                            ))}
                                        </div>
                                        <span className="text-[8px] uppercase text-accent/20">
                                            {new Date(rev.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-accent/60 italic leading-relaxed">"{rev.text}"</p>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <div className="py-12 text-center opacity-20 uppercase tracking-[0.2em] text-xs">Hech kim sharh qoldirmagan</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
