import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { Send, ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { chatApi } from '../api/api';

const ChatScreen = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingImage, setSendingImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const flatListRef = useRef(null);

    const fetchHistory = async () => {
        try {
            const res = await chatApi.getHistory(userId);
            setMessages(res.data || []);
        } catch (error) {
            console.error('Fetch history error:', error);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [userId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            receiver_id: userId,
            content: newMessage,
        };

        try {
            await chatApi.sendMessage(messageData);
            setNewMessage('');
            fetchHistory();
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    const handleImagePress = () => {
        Alert.alert(
            "Rasm yuborish",
            "Rasm olish usulini tanlang",
            [
                { text: "Kamera", onPress: takePhoto },
                { text: "Galereya", onPress: pickImage },
                { text: "Bekor qilish", style: "cancel" }
            ]
        );
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Xato', 'Kameraga kirishga ruxsat kerak');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false, // Don't crop to keep original
            quality: 1,
        });

        if (!result.canceled) {
            handleSendImage(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Xato', 'Galereyaga kirishga ruxsat kerak');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            handleSendImage(result.assets[0].uri);
        }
    };

    const handleSendImage = async (uri) => {
        const tempId = 'temp-' + Date.now();
        const optimisticMessage = {
            id: tempId,
            sender_id: 'me', // Temporary ID to show as sent by me
            receiver_id: userId,
            image_url: uri, // Local URI
            is_pending: true,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setSendingImage(true);

        const formData = new FormData();
        const fileName = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('receiver_id', userId.toString());
        formData.append('file', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: fileName,
            type: type,
        });

        try {
            await chatApi.sendImage(formData);
            // Remove the optimistic message and fetch real history
            setMessages(prev => prev.filter(m => m.id !== tempId));
            fetchHistory();
        } catch (error) {
            console.error('Send image error:', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            const errorMsg = error.response?.data?.detail || 'Rasmni yuborishda xatolik';
            Alert.alert('Xato', errorMsg);
        } finally {
            setSendingImage(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{userName}</Text>
                    <Text style={styles.headerStatus}>online</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageWrapper,
                        item.sender_id === userId ? styles.receivedWrapper : styles.sentWrapper,
                        item.is_pending ? { opacity: 0.7 } : null
                    ]}>
                        <View style={[
                            styles.messageBubble,
                            item.sender_id === userId ? styles.receivedBubble : styles.sentBubble
                        ]}>
                            {item.image_url ? (
                                <TouchableOpacity
                                    onPress={() => setSelectedImage(item.image_url)}
                                    disabled={item.is_pending}
                                >
                                    <View>
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={styles.messageImage}
                                            resizeMode="contain"
                                        />
                                        {item.is_pending && (
                                            <View style={styles.loadingOverlay}>
                                                <ActivityIndicator size="large" color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ) : null}
                            {item.content ? (
                                <Text style={[
                                    styles.messageText,
                                    item.sender_id !== userId ? styles.sentMessageText : null
                                ]}>
                                    {item.content}
                                </Text>
                            ) : null}
                            <Text style={[
                                styles.messageTime,
                                item.sender_id !== userId ? styles.sentMessageTime : null
                            ]}>
                                {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={handleImagePress}
                        disabled={sendingImage}
                    >
                        {sendingImage ? (
                            <ActivityIndicator size="small" color="#7c3aed" />
                        ) : (
                            <Camera color="#7c3aed" size={24} />
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Xabar yozing..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline={Boolean(true)}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, Boolean(!newMessage.trim()) ? styles.sendButtonDisabled : null]}
                        onPress={handleSend}
                        disabled={Boolean(!newMessage.trim())}
                    >
                        <Send color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <Modal
                visible={!!selectedImage}
                transparent={true}
                onRequestClose={() => setSelectedImage(null)}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedImage(null)}
                >
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Text style={styles.closeButtonText}>Yopish</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerStatus: {
        fontSize: 12,
        color: '#10b981',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 12,
        maxWidth: '80%',
    },
    receivedWrapper: {
        alignSelf: 'flex-start',
    },
    sentWrapper: {
        alignSelf: 'flex-end',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    receivedBubble: {
        backgroundColor: '#f3f4f6',
        borderBottomLeftRadius: 4,
    },
    sentBubble: {
        backgroundColor: '#7c3aed',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#1f2937',
        lineHeight: 20,
    },
    sentMessageText: {
        color: '#fff',
    },
    messageTime: {
        fontSize: 10,
        color: '#9ca3af',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    sentMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        fontSize: 15,
        maxHeight: 100,
        color: '#1f2937',
    },
    sendButton: {
        width: 48,
        height: 48,
        backgroundColor: '#7c3aed',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButtonDisabled: {
        backgroundColor: '#ddd6fe',
    },
    imageButton: {
        padding: 8,
        marginRight: 4,
    },
    messageImage: {
        width: 240,
        height: 180,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#000',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    }
});

export default ChatScreen;
