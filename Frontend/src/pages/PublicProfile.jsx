import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileApi, reviewApi, authApi } from '../api/api';
import { Button, Input, Spinner, ProductCard } from '../components/UIComponents';
import {
    ChevronLeft,
    MapPin,
    Briefcase,
    MessageSquare,
    Star,
    Phone,
    AtSign,
    ShieldCheck,
    Share2,
    Calendar
} from 'lucide-react';

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
            setItems(itemsRes.data || []);
            setReviews(revRes.data || []);

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
        if (e) e.preventDefault();
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Spinner size="lg" />
        </div>
    );

    const rating = profile?.user?.rating || 0;

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* iOS Style Header */}
            <div className="bg-[#f9fafb] pt-12 pb-6 px-6 rounded-b-[32px] border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-[17px] font-black text-gray-900">Profil</h1>
                <button
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-100"
                >
                    <Share2 size={20} />
                </button>
            </div>

            <div className="px-6 pt-10 max-w-4xl mx-auto">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-[40px] bg-white border-[4px] border-white overflow-hidden flex items-center justify-center shadow-2xl ring-4 ring-[#7c3aed]/5">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-4xl">👤</div>
                            )}
                        </div>
                        {profile?.is_verified && (
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#10b981] rounded-full border-[3px] border-white flex items-center justify-center text-white text-[14px] font-bold shadow-lg">
                                ✓
                            </div>
                        )}
                    </div>

                    <h1 className="text-[28px] font-black text-gray-900 leading-tight mb-2 text-center">
                        {profile?.full_name || 'Foydalanuvchi'}
                    </h1>

                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={i < Math.floor(rating) ? "currentColor" : "none"}
                                    className={i < Math.floor(rating) ? "" : "text-gray-200"}
                                />
                            ))}
                        </div>
                        <span className="text-[14px] font-black text-gray-900">{rating.toFixed(1)}</span>
                        <span className="text-gray-300 mx-1">•</span>
                        <span className="text-[12px] font-bold text-gray-400">{reviews.length} ta sharh</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        <div className="bg-[#f3f4f6] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#7c3aed]" />
                            <span className="text-[11px] font-black text-gray-500 uppercase">{profile?.region || 'Hudud'}</span>
                        </div>
                        <div className="bg-[#7c3aed] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Briefcase size={14} className="text-white" />
                            <span className="text-[11px] font-black text-white uppercase">{profile?.user?.role}</span>
                        </div>
                    </div>

                    <div className="max-w-md text-center mb-10">
                        <p className="text-gray-500 text-[15px] leading-relaxed italic">
                            {profile?.bio || 'Hozircha tavsif mavjud emas.'}
                        </p>
                    </div>

                    <div className="w-full flex gap-3">
                        <Button
                            className="flex-1 py-4 rounded-2xl shadow-lg shadow-[#7c3aed]/20 flex items-center justify-center gap-2"
                            onClick={() => navigate(`/chat/${userId}`)}
                        >
                            <MessageSquare size={20} />
                            Xabar yozish
                        </Button>
                        {profile?.user?.phone_visible && (
                            <a
                                href={`tel:${profile.user.phone}`}
                                className="w-14 h-14 bg-[#10b981] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#10b981]/20"
                            >
                                <Phone size={24} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Items Grid */}
                <div className="mb-12">
                    <h2 className="text-[20px] font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Briefcase size={22} className="text-[#7c3aed]" /> Katalog
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                            <ProductCard
                                key={item.id}
                                image={item.image_url1}
                                title={item.title}
                                price={item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan'}
                                location={item.location || profile?.region}
                                ownerName={profile?.full_name}
                                isVerified={profile?.is_verified}
                                onClick={() => { }} // Already on profile
                            />
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-12">
                    <h2 className="text-[20px] font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Star size={22} className="text-[#7c3aed]" /> Sharhlar
                    </h2>

                    {/* Add Review */}
                    {currentUser?.id !== parseInt(userId) && (
                        <div className="bg-[#f9fafb] p-6 rounded-3xl border border-gray-100 mb-8">
                            <h4 className="text-[12px] font-black text-gray-400 uppercase mb-4">Sharh qoldirish</h4>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setNewReview({ ...newReview, stars: s })}
                                        className={`transition-all ${s <= newReview.stars ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                                    >
                                        <Star size={28} fill={s <= newReview.stars ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                placeholder="Fikringizni qoldiring..."
                                className="w-full p-4 bg-white border border-gray-100 rounded-2xl min-h-[100px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/10 mb-4"
                                value={newReview.text}
                                onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                            />
                            <Button
                                className="w-full py-4 rounded-xl"
                                onClick={handleAddReview}
                                disabled={submitting}
                            >
                                {submitting ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
                            </Button>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.map(rev => (
                            <div key={rev.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < rev.stars ? "currentColor" : "none"} className={i < rev.stars ? "" : "text-gray-100"} />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-300 text-[10px] font-bold uppercase">
                                        <Calendar size={10} />
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-[15px] leading-relaxed font-medium italic">"{rev.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
