import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/api';
import {
    ChevronLeft,
    MessageSquare,
    Home as HomeIcon,
    User,
    ClipboardList,
    Search
} from 'lucide-react';
import { Spinner } from '../components/UIComponents';

const Messages = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 7000);
        return () => clearInterval(interval);
    }, []);

    const fetchChats = async () => {
        try {
            const res = await chatApi.getChats();
            setChats(res.data || []);
        } catch (err) {
            console.error("Xabarlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Spinner size="lg" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="px-5 pt-12 pb-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-gray-900 transition-transform active:scale-90">
                        <ChevronLeft size={28} />
                    </button>
                </div>
                <h1 className="text-[34px] font-black text-gray-900 tracking-tight">Xabarlar</h1>
            </div>

            {/* Chats List */}
            <div className="bg-white">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-gray-200" />
                        </div>
                        <p className="text-gray-400 text-[17px] font-medium">Hozircha xabarlar yo'q</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {chats.map(item => (
                            <div
                                key={item.user_id}
                                className="flex items-center px-5 py-5 cursor-pointer active:bg-gray-50 transition-colors"
                                onClick={() => navigate(`/chat/${item.user_id}`)}
                            >
                                {/* Avatar */}
                                <div className="w-[60px] h-[60px] rounded-[24px] bg-[#f9fafb] border border-gray-100 flex items-center justify-center shrink-0 shadow-sm relative">
                                    <span className="text-[20px] font-black text-[#7c3aed]">
                                        {item.full_name ? item.full_name[0].toUpperCase() : '?'}
                                    </span>
                                    {item.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                            <span className="text-[10px] font-black text-white">{item.unread_count}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Info */}
                                <div className="flex-1 ml-4 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-[17px] font-black text-gray-900 truncate pr-2 tracking-tight">
                                            {item.full_name || 'Foydalanuvchi'}
                                        </h3>
                                        <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap uppercase">
                                            {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-[14px] truncate mr-2 ${item.unread_count > 0 ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                                            {item.last_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center py-3 px-2 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <HomeIcon size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Asosiy</span>
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <ClipboardList size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Kabinet</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <Search size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Qidiruv</span>
                </button>
                <button
                    className="flex flex-col items-center gap-1 min-w-[64px] text-[#7c3aed] transition-all"
                >
                    <div className="relative">
                        <MessageSquare size={24} />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#7c3aed] rounded-full shadow-lg shadow-[#7c3aed]/40" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">Xabarlar</span>
                </button>
                <button
                    onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/login')}
                    className="flex flex-col items-center gap-1 min-w-[64px] text-gray-400 transition-all active:scale-90"
                >
                    <User size={24} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Profil</span>
                </button>
            </div>
        </div>
    );
};

export default Messages;
