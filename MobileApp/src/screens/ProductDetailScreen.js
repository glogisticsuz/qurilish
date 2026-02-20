import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Share, Modal, FlatList, Linking, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, MessageCircle, Share2, ShieldCheck, Heart, Star, X, Calendar } from 'lucide-react-native';
import { Button, Input, Spinner } from '../components/UIComponents';
import api, { reviewApi, authApi } from '../api/api';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [newReview, setNewReview] = useState({ stars: 5, text: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    React.useEffect(() => {
        fetchReviews();
        checkUser();
    }, []);

    const fetchReviews = async () => {
        try {
            const userId = item.userId || item.profile?.user_id;
            if (userId) {
                const res = await reviewApi.getReviews(userId);
                setReviews(res.data || []);
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const checkUser = async () => {
        try {
            const res = await authApi.getMe();
            setCurrentUser(res.data);
        } catch (e) { }
    };

    const handleAddReview = async () => {
        if (!currentUser) {
            navigation.navigate('Login');
            return;
        }
        if (!newReview.text.trim()) {
            Alert.alert('Xato', 'Fikringizni yozing');
            return;
        }

        setSubmittingReview(true);
        try {
            const userId = item.userId || item.profile?.user_id;
            await reviewApi.addReview(userId, {
                stars: newReview.stars,
                text: newReview.text
            });
            setNewReview({ stars: 5, text: '' });
            fetchReviews();
            Alert.alert('Muvaffaqiyat', 'Sharhingiz qabul qilindi');
        } catch (error) {
            Alert.alert('Xato', error.response?.data?.detail || 'Sharh yuborishda xatolik');
        } finally {
            setSubmittingReview(false);
        }
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `HamkorQurilish: ${item.title}\nNarxi: ${item.price}\nManzil: ${item.location}`,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{item.user}</Text>
                <View style={styles.ratingContainer}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={Boolean(false)}>
                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => setIsImageModalVisible(true)} activeOpacity={0.9}>
                        <Image source={{ uri: item.image }} style={styles.mainImage} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.circleButton} onPress={() => navigation.goBack()}>
                            <ChevronLeft color="#111827" size={24} />
                        </TouchableOpacity>
                        <View style={styles.rightActions}>
                            <TouchableOpacity style={styles.circleButton} onPress={onShare}>
                                <Share2 color="#111827" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.circleButton}>
                                <Heart color="#ef4444" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{item.price}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>YANGI</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{item.title}</Text>

                    {/* Instagram-style Description right under title */}
                    <Text style={styles.description}>
                        {item.description || "Ushbu xizmat/mahsulot HamkorQurilish platformasi orqali kafolatlangan va sinovdan o'tgan mutaxassislar tomonidan taqdim etiladi."}
                    </Text>

                    <View style={styles.locationRow}>
                        <MapPin color="#7c3aed" size={16} />
                        <Text style={styles.location}>{item.location}</Text>
                    </View>

                    {(item.phone || item.profile?.user?.phone) && (
                        <View style={[styles.locationRow, { marginTop: -10 }]}>
                            <Text style={{ color: '#7c3aed', fontWeight: 'bold' }}>Tel: </Text>
                            <Text style={styles.location}>{item.phone || item.profile?.user?.phone}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Owner Info */}
                    <TouchableOpacity
                        style={styles.ownerCard}
                        onPress={() => navigation.navigate('PublicProfile', { userId: item.userId || item.profile?.user_id || 1 })}
                    >
                        <View style={styles.ownerAvatar}>
                            <Text style={styles.avatarInitial}>{item.ownerName?.[0] || 'U'}</Text>
                        </View>
                        <View style={styles.ownerText}>
                            <View style={styles.ownerNameRow}>
                                <Text style={styles.ownerName}>{item.ownerName}</Text>
                                {Boolean(item.isVerified) ? <ShieldCheck color="#10b981" size={14} style={{ marginLeft: 4 }} /> : null}
                            </View>
                            <Text style={styles.ownerStatus}>Online · Platformada 1 yildan beri</Text>
                        </View>
                        <ChevronLeft color="#9ca3af" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    {item.profile?.bio ? (
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioLabel}>Mutaxassis haqida:</Text>
                            <Text style={styles.bioText}>{item.profile.bio}</Text>
                        </View>
                    ) : null}

                    <View style={styles.divider} />

                    {/* Reviews Section */}
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Sharhlar</Text>
                        <Text style={styles.reviewCount}>{reviews.length} ta</Text>
                    </View>

                    {/* Add Review Form */}
                    {currentUser?.id !== (item.userId || item.profile?.user_id) && (
                        <View style={styles.addReviewBox}>
                            <Text style={styles.addReviewTitle}>SHARH QOLDIRISH</Text>
                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <TouchableOpacity key={s} onPress={() => setNewReview({ ...newReview, stars: s })}>
                                        <Star
                                            size={32}
                                            color={s <= newReview.stars ? "#f59e0b" : "#e5e7eb"}
                                            fill={s <= newReview.stars ? "#f59e0b" : "none"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.reviewInput}
                                placeholder="Xizmat haqida fikringizni yozing..."
                                value={newReview.text}
                                onChangeText={(t) => setNewReview({ ...newReview, text: t })}
                                multiline
                            />
                            <Button
                                title={submittingReview ? "YUBORILMOQDA..." : "YUBORISH"}
                                disabled={submittingReview}
                                onPress={handleAddReview}
                                style={styles.submitReviewBtn}
                            />
                        </View>
                    )}

                    {loadingReviews ? (
                        <ActivityIndicator color="#7c3aed" style={{ marginVertical: 20 }} />
                    ) : reviews.length === 0 ? (
                        <Text style={styles.noReviews}>Hozircha sharhlar yo'q</Text>
                    ) : (
                        reviews.map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewUser}>Mijoz</Text>
                                    <View style={styles.ratingContainer}>
                                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                        <Text style={styles.ratingText}>{review.stars}</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.text}</Text>
                                <View style={styles.reviewDateRow}>
                                    <Calendar size={12} color="#9ca3af" />
                                    <Text style={styles.reviewDate}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}

                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => navigation.navigate('Chat', { userId: item.userId || 1, userName: item.ownerName })}
                >
                    <MessageCircle color="#7c3aed" size={24} />
                </TouchableOpacity>
                <Button
                    title="BOG'LANISH"
                    style={styles.callButton}
                    onPress={() => {
                        const phoneNumber = item.phone || item.profile?.user?.phone;
                        if (phoneNumber) {
                            Linking.openURL(`tel:${phoneNumber}`);
                        } else {
                            Alert.alert('Xato', 'Telefon raqami topilmadi');
                        }
                    }}
                />
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={isImageModalVisible}
                transparent={Boolean(true)}
                onRequestClose={() => setIsImageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={() => setIsImageModalVisible(false)}
                    >
                        <X color="#fff" size={30} />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        width: width,
        height: width * 0.8,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    headerActions: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 10,
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#fff',
        marginTop: -30,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
        color: '#7c3aed',
    },
    badge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#6b7280',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    location: {
        color: '#6b7280',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 20,
    },
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 18,
        backgroundColor: '#ddd6fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7c3aed',
    },
    ownerText: {
        flex: 1,
        marginLeft: 16,
    },
    ownerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    ownerStatus: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 24,
    },
    bioContainer: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 16,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#7c3aed',
    },
    bioLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7c3aed',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    bioText: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff',
        gap: 16,
    },
    chatButton: {
        width: 60,
        height: 60,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ddd6fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButton: {
        flex: 1,
        height: 60,
        borderRadius: 30,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeModalButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    fullScreenImage: {
        width: width,
        height: height,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#7c3aed',
        fontWeight: 'bold',
        fontSize: 14,
    },
    reviewItem: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#111827',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fffbeb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#d97706',
    },
    reviewComment: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 6,
        lineHeight: 20,
    },
    reviewDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginLeft: 4,
    },
    reviewDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    reviewCount: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: 'bold',
    },
    addReviewBox: {
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    addReviewTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#6b7280',
        marginBottom: 16,
        letterSpacing: 1,
    },
    starRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    reviewInput: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: '#1f2937',
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 16,
    },
    submitReviewBtn: {
        height: 54,
        borderRadius: 16,
    },
    noReviews: {
        textAlign: 'center',
        color: '#9ca3af',
        marginVertical: 20,
        fontStyle: 'italic',
    }
});

export default ProductDetailScreen;
