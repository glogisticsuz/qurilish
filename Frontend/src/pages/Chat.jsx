import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, authApi, profileApi } from '../api/api';
import { Button, Input } from '../components/UIComponents';
import { ChevronLeft, Camera, Send, X, Image as ImageIcon } from 'lucide-react';

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [chatPartner, setChatPartner] = useState(null);
    const [sendingImage, setSendingImage] = useState(false);
    const scrollRef = useRef();
    const fileInputRef = useRef();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        try {
            const [userRes, partnerRes] = await Promise.all([
                authApi.getMe(),
                profileApi.getPublicProfile(userId)
            ]);
            setCurrentUser(userRes.data);
            setChatPartner(partnerRes.data);
            fetchMessages();
            chatApi.markAsRead(userId);
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async () => {
        try {
            const res = await chatApi.getHistory(userId);
            setMessages(res.data || []);
            // Mark as read if there are unread messages from partner
            if (res.data && res.data.some(m => m.sender_id === parseInt(userId) && !m.is_read)) {
                chatApi.markAsRead(userId);
            }
        } catch (err) { console.error(err); }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await chatApi.sendMessage({ receiver_id: userId, content: newMessage });
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch (err) { alert("Xabar yuborishda xatolik"); }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSendingImage(true);
        const formData = new FormData();
        formData.append('receiver_id', userId);
        formData.append('file', file);

        try {
            await chatApi.sendImage(formData);
            fetchMessages();
        } catch (err) {
            alert("Rasmni yuborishda xatolik");
        } finally {
            setSendingImage(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* iOS Style Header */}
            <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex-1 ml-2">
                    <h1 className="text-[17px] font-bold text-gray-900 leading-tight">
                        {chatPartner ? (chatPartner.full_name || chatPartner.user?.phone) : 'Yuklanmoqda...'}
                    </h1>
                    <p className="text-[12px] text-green-500 font-medium">online</p>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white scrollbar-hide">
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-[20px] px-4 py-2.5 shadow-sm ${isMe
                                    ? 'bg-[#7c3aed] text-white rounded-br-sm'
                                    : 'bg-[#f3f4f6] text-[#1f2937] rounded-bl-sm'
                                }`}>
                                {msg.image_url ? (
                                    <div className="mb-1 rounded-lg overflow-hidden bg-black/5">
                                        <img
                                            src={msg.image_url}
                                            alt="Chat"
                                            className="max-w-full max-h-[300px] object-contain cursor-pointer"
                                            onClick={() => window.open(msg.image_url, '_blank')}
                                        />
                                    </div>
                                ) : null}
                                {msg.content && <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                    <span className="text-[10px] font-medium">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* iOS Style Input Area */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className="p-2 text-[#7c3aed] hover:bg-purple-50 rounded-full transition-colors disabled:opacity-50"
                        disabled={sendingImage}
                    >
                        {sendingImage ? (
                            <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Camera size={26} />
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Xabar yozing..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="bg-[#f9fafb] border-none py-2.5 pr-12 text-[15px] rounded-full focus:ring-0"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#7c3aed] disabled:text-[#ddd6fe] transition-colors"
                        >
                            <Send size={22} fill="currentColor" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Chat;
