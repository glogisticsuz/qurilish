import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, MapPin, Briefcase, Trash2, LogOut, Settings, Plus } from 'lucide-react-native';
import RNAsyncStorage from '@react-native-async-storage/async-storage';
import { profileApi, authApi } from '../api/api';
import { Button } from '../components/UIComponents';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [userRes, profileRes, portfolioRes] = await Promise.all([
                authApi.getMe(),
                profileApi.getMe(),
                profileApi.getMyPortfolio()
            ]);
            setUser(userRes.data);
            setProfile(profileRes.data);
            setPortfolio(portfolioRes.data || []);
        } catch (error) {
            console.error('Fetch profile data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = async () => {
        Alert.alert(
            "Chiqish",
            "Haqiqatan ham chiqmoqchimisiz?",
            [
                { text: "Yo'q", style: "cancel" },
                {
                    text: "Ha",
                    onPress: async () => {
                        await RNAsyncStorage.removeItem('token');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "O'chirish",
            "Ushbu e'lonni o'chirmoqchimisiz?",
            [
                { text: "Bekor qilish", style: "cancel" },
                {
                    text: "O'chirish",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await profileApi.deletePortfolio(id);
                            setPortfolio(portfolio.filter(item => item.id !== id));
                        } catch (error) {
                            Alert.alert('Xato', 'O\'chirishda xatolik yuz berdi');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={Boolean(refreshing)}
                        onRefresh={onRefresh}
                        tintColor="#7c3aed"
                        colors={['#7c3aed']}
                    />
                }
                showsVerticalScrollIndicator={Boolean(false)}
            >
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.placeholderAvatar]}>
                                    <Camera color="#9ca3af" size={32} />
                                </View>
                            )}
                            {Boolean(profile?.is_verified) ? (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>✓</Text>
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.textInfo}>
                            <Text style={styles.name}>{profile?.full_name || 'Foydalanuvchi'}</Text>
                            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>{user?.phone}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <MapPin size={12} color="#7c3aed" />
                                    <Text style={styles.badgeText}>{profile?.region || 'Hudud'}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.badge, styles.roleBadge]}
                                    onLongPress={() => {
                                        Alert.alert(
                                            "Rolni o'zgartirish (Debug)",
                                            "Rolni tanlang:",
                                            [
                                                { text: "Mijoz", onPress: () => authApi.updateRole('customer').then(fetchData) },
                                                { text: "Usta", onPress: () => authApi.updateRole('pro').then(fetchData) },
                                                { text: "Texnika", onPress: () => authApi.updateRole('supplier').then(fetchData) },
                                                { text: "Bekor qilish", style: "cancel" }
                                            ]
                                        );
                                    }}
                                >
                                    <Briefcase size={12} color="#fff" />
                                    <Text style={[styles.badgeText, styles.roleBadgeText]}>{user?.role?.toUpperCase()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('EditProfile')}>
                            <Settings color="#4b5563" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, styles.logoutButton]} onPress={handleLogout}>
                            <LogOut color="#ef4444" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mening e'lonlarim</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PostAd')}>
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addButtonText}>Yangi</Text>
                        </TouchableOpacity>
                    </View>

                    {portfolio.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Hali e'lonlar yo'q</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {portfolio.map(item => (
                                <View key={item.id} style={styles.card}>
                                    <Image source={{ uri: item.image_url1 }} style={styles.cardImage} />
                                    <View style={styles.cardOverlay}>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(item.id)}
                                        >
                                            <Trash2 color="#fff" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.cardPrice}>{item.price?.toLocaleString()} so'm</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
        backgroundColor: '#f9fafb',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 28,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#ddd6fe',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#10b981',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    verifiedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    textInfo: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
        marginLeft: 4,
    },
    roleBadge: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    roleBadgeText: {
        color: '#fff',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    logoutButton: {
        borderColor: '#fee2e2',
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 50) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    cardOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    deleteButton: {
        width: 28,
        height: 28,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: 10,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    cardPrice: {
        fontSize: 12,
        color: '#7c3aed',
        fontWeight: '900',
        marginTop: 4,
    }
});

export default ProfileScreen;
