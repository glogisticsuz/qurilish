import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '../api/config';

const { width } = Dimensions.get('window');

const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        axios.get(`${API_URL}/ads/banners`)
            .then(res => setBanners(res.data || []))
            .catch(err => console.error('Banners fetch error:', err));
    }, []);

    if (banners.length === 0) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal={Boolean(true)}
                pagingEnabled={Boolean(true)}
                showsHorizontalScrollIndicator={Boolean(false)}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    setActiveIndex(Math.round(x / width));
                }}
                scrollEventThrottle={16}
            >
                {banners.map((banner, index) => (
                    <TouchableOpacity key={banner.id} activeOpacity={0.9} style={styles.bannerWrapper}>
                        <Image
                            source={{ uri: banner.image_url }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                        <View style={styles.overlay}>
                            <Text style={styles.bannerTitle}>{banner.title}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>REKLAMA</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.indicators}>
                {banners.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === activeIndex ? styles.activeDot : null
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 180,
        marginVertical: 10,
    },
    bannerWrapper: {
        width: width,
        height: 180,
        paddingHorizontal: 16,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        height: '60%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 15,
        justifyContent: 'flex-end',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    badge: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: -20,
        zIndex: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 15,
    }
});

export default BannerCarousel;
