import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, Share, Modal, FlatList, Linking } from 'react-native';
import { ChevronLeft, MapPin, MessageCircle, Share2, ShieldCheck, Heart, Star, X } from 'lucide-react-native';
import { Button } from '../components/UIComponents';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    // Mock Reviews - in real app, fetch from API
    const reviews = [
        { id: 1, user: 'Azizbek', rating: 5, comment: 'Juda sifatli xizmat, rahmat!', date: '12.02.2024' },
        { id: 2, user: 'Sardor', rating: 4, comment: 'Tez va arzon.', date: '10.02.2024' },
    ];

    const onShare = async () => {
        try {
            await Share.share({
                message: `MegaStroy: ${item.title}\nNarxi: ${item.price}\nManzil: ${item.location}`,
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
                        {item.description || "Ushbu xizmat/mahsulot MegaStroy platformasi orqali kafolatlangan va sinovdan o'tgan mutaxassislar tomonidan taqdim etiladi."}
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
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Barchasi</Text>
                        </TouchableOpacity>
                    </View>

                    {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewUser}>{review.user}</Text>
                                <View style={styles.ratingContainer}>
                                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                    <Text style={styles.ratingText}>{review.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                            <Text style={styles.reviewDate}>{review.date}</Text>
                        </View>
                    ))}

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
    }
});

export default ProductDetailScreen;
