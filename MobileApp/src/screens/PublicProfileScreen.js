import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl, Dimensions, FlatList } from 'react-native';
import { MapPin, Briefcase, ChevronLeft, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileApi } from '../api/api';
import { Button, ProductCard } from '../components/UIComponents';

const { width } = Dimensions.get('window');

const PublicProfileScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [profileRes, portfolioRes] = await Promise.all([
                profileApi.getPublicProfile(userId),
                profileApi.getUserPortfolio(userId)
            ]);
            setProfile(profileRes.data);
            setPortfolio(portfolioRes.data || []);
        } catch (error) {
            console.error('Fetch public profile error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View style={styles.headerContent}>
            <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                            <Text style={styles.avatarInitial}>{profile?.full_name?.[0] || 'U'}</Text>
                        </View>
                    )}
                    {Boolean(profile?.is_verified) && (
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={14} color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{portfolio.length}</Text>
                        <Text style={styles.statLabel}>E'lonlar</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{profile?.rating || 0}</Text>
                        <Text style={styles.statLabel}>Reyting</Text>
                    </View>
                </View>
            </View>

            <View style={styles.bioSection}>
                <Text style={styles.name}>{profile?.full_name || 'Yuklanmoqda...'}</Text>
                <View style={styles.locationRow}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.locationText}>{profile?.region || 'O\'zbekiston'}</Text>
                </View>
                {profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
            </View>

            <View style={styles.buttonRow}>
                <Button
                    title="Xabar yozish"
                    style={styles.msgButton}
                    onPress={() => navigation.navigate('Chat', { userId: profile?.user_id || userId, userName: profile?.full_name })}
                />
            </View>

            <View style={styles.tabsContainer}>
                <View style={styles.activeTab}>
                    <Briefcase size={20} color="#7c3aed" />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Profil</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={portfolio}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            title={item.title}
                            price={item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan'}
                            location={item.location || profile?.region || 'O\'zbekiston'}
                            image={item.image_url1}
                            ownerName={profile?.full_name || 'Foydalanuvchi'}
                            isVerified={Boolean(profile?.is_verified)}
                            description={item.description}
                            onClick={() => navigation.navigate('ProductDetail', {
                                item: {
                                    ...item,
                                    image: item.image_url1,
                                    price: item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan',
                                    location: item.location || profile?.region || 'O\'zbekiston',
                                    ownerName: profile?.full_name || 'Foydalanuvchi',
                                    isVerified: Boolean(profile?.is_verified),
                                    profile: profile
                                }
                            })}
                        />
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
                }
                ListEmptyComponent={!loading && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Hali e'lonlar yo'q</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerContent: {
        paddingTop: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    placeholderAvatar: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7c3aed',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
        gap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    bioSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#6b7280',
    },
    bioText: {
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },
    buttonRow: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    msgButton: {
        height: 40,
        borderRadius: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    activeTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
    },
    cardWrapper: {
        width: '48%',
        marginHorizontal: '1%',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    }
});

export default PublicProfileScreen;
