import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { chatApi } from '../api/api';
import { MessageSquare } from 'lucide-react-native';

const MessagesScreen = ({ navigation }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChats = async () => {
        try {
            const res = await chatApi.getChats();
            setChats(res.data || []);
        } catch (error) {
            console.error('Fetch chats error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchChats();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Xabarlar</Text>
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => (item.user_id ? item.user_id.toString() : Math.random().toString())}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => navigation.navigate('Chat', { userId: item.user_id, userName: item.full_name })}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.full_name ? item.full_name[0].toUpperCase() : '?'}</Text>
                        </View>
                        <View style={styles.chatInfo}>
                            <View style={styles.chatHeader}>
                                <Text style={styles.userName}>{item.full_name || 'Foydalanuvchi'}</Text>
                                <Text style={styles.time}>
                                    {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </Text>
                            </View>
                            <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>
                        </View>
                        {Boolean(item.unread_count > 0) ? (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unread_count}</Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={Boolean(refreshing)}
                        onRefresh={onRefresh}
                        tintColor="#7c3aed"
                        colors={['#7c3aed']}
                    />
                }
                ListEmptyComponent={
                    loading === false ? (
                        <View style={styles.emptyContainer}>
                            <MessageSquare size={64} color="#e5e7eb" />
                            <Text style={styles.emptyText}>Hozircha xabarlar yo'q</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f9fafb',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7c3aed',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    time: {
        fontSize: 12,
        color: '#9ca3af',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6b7280',
    },
    unreadBadge: {
        backgroundColor: '#ef4444',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
    }
});

export default MessagesScreen;
