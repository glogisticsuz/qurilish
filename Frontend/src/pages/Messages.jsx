import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, GlassCard } from '../components/UIComponents';
import { chatApi, authApi } from '../api/api';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const Messages = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await chatApi.getChats();
            setChats(res.data);
        } catch (err) {
            console.error("Xabarlarni yuklashda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="secondary"
                        className="px-4 py-2"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ArrowLeft size={16} />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-heading font-black">Xabarlar</h1>
                        <p className="text-accent/40 text-xs uppercase tracking-widest mt-1">
                            {chats.length} ta suhbat
                        </p>
                    </div>
                </div>

                {/* Chats List */}
                {chats.length === 0 ? (
                    <div className="text-center py-20">
                        <MessageSquare size={64} className="mx-auto text-accent/20 mb-4" />
                        <p className="text-accent/40 uppercase tracking-widest text-sm">
                            Hali xabarlar yo'q
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chats.map(user => (
                            <GlassCard
                                key={user.id}
                                className="p-6 cursor-pointer hover:border-primary/50 transition-all"
                                onClick={() => navigate(`/chat/${user.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                                        👤
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white">
                                            {user.phone}
                                        </h3>
                                        <p className="text-xs text-accent/40 uppercase tracking-widest">
                                            {user.role}
                                        </p>
                                    </div>
                                    <MessageSquare className="text-primary" size={20} />
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
