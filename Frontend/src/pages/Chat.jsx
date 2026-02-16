import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, authApi } from '../api/api';
import { Button, Input, GlassCard } from '../components/UIComponents';
import { ArrowLeft, Send } from 'lucide-react';

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchMessages, 3000); // Polling as fallback for WS MVP
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        try {
            const userRes = await authApi.getMe();
            setCurrentUser(userRes.data);
            fetchMessages();
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async () => {
        try {
            const res = await chatApi.getHistory(userId);
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await chatApi.sendMessage({ receiver_id: userId, content: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) { alert("Xabar yuborishda xatolik"); }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="border-b border-white/5 bg-background/80 backdrop-blur-md p-4 sticky top-0 z-10 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-heading font-bold">Messenger</h1>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMe ? 'bg-primary text-background font-bold' : 'bg-white/5 text-accent border border-white/5'}`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[8px] uppercase mt-1 opacity-40 ${isMe ? 'text-background/60' : ''}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-white/5 sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
                    <Input
                        placeholder="Xabar yozing..."
                        className="py-6"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" className="px-8 aspect-square flex items-center justify-center">
                        <Send size={20} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
