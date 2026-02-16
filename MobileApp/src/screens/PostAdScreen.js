import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, MapPin, ChevronDown, CheckCircle, X, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { profileApi, authApi } from '../api/api';
import { Button } from '../components/UIComponents';

const PostAdScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        title: '',
        price: '',
        price_type: 'soat',
        category_id: null,
        location: '',
    });
    const [images, setImages] = useState([]);

    const categories = [
        { id: 1, name: 'Ustalar', role: 'pro' },
        { id: 2, name: 'Texnika Ijarasi', role: 'supplier' },
        { id: 3, name: 'Qurilish Mollari', role: 'supplier' },
        { id: 4, name: 'Prorablar', role: 'pro' },
    ];

    useFocusEffect(
        React.useCallback(() => {
            authApi.getMe().then(res => {
                console.log('Refetched User:', res.data);
                setUser(res.data);
                const filtered = categories.filter(c => c.role === res.data.role);
                if (filtered.length > 0) {
                    // Only set category if not already set or logic requires it
                    if (!data.category_id) {
                        setData(prev => ({ ...prev, category_id: filtered[0].id }));
                    }
                }
            });
        }, [])
    );

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert('Cheklov', 'Maksimal 5 ta rasm yuklash mumkin');
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Xato', 'Rasm tanlash uchun ruxsat berishingiz kerak');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const selectedUris = result.assets.map(asset => asset.uri);
            setImages([...images, ...selectedUris]);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const filteredCategories = categories.filter(c => c.role === user?.role);

    const handleSubmit = async () => {
        if (!data.title || !data.category_id) {
            Alert.alert('Xato', 'Iltimos, barcha maydonlarni to\'ldiring');
            return;
        }
        if (images.length === 0) {
            Alert.alert('Xato', 'Kamida bitta rasm yuklang');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('price', data.price || 0);
        formData.append('price_type', data.price_type);
        formData.append('location', data.location);
        formData.append('category_id', data.category_id);

        images.forEach((img, index) => {
            const fileName = img.split('/').pop();
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('files', {
                uri: Platform.OS === 'ios' ? img.replace('file://', '') : img,
                name: fileName,
                type: type,
            });
        });

        try {
            await profileApi.uploadPortfolio(formData);
            Alert.alert('Muvaffaqiyat', 'E\'lon muvaffaqiyatli yuklandi', [
                { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Root' }] }) }
            ]);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Xato', 'E\'lonni yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    // Debugging user role
    console.log('Current User for PostAd:', user);

    if (user && (user.role === 'customer' || user.role?.toLowerCase() === 'customer' || user.role === 'client')) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="#111827" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>E'lon joylash</Text>
                </View>
                <View style={styles.deniedContainer}>
                    <XCircle color="#ef4444" size={64} />
                    <Text style={styles.deniedTitle}>Ruxsat berilmagan</Text>
                    <Text style={styles.deniedText}>
                        Mijoz hisobi orqali e'lon joylay olmaysiz. E'lon joylash uchun "Usta" yoki "Texnika egasi" sifatida ro'yxatdan o'tishingiz kerak.
                    </Text>
                    <Button
                        title="Tushunarlik"
                        onPress={() => navigation.goBack()}
                        style={styles.deniedButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yangi e'lon</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={Boolean(false)}
            >
                <View style={styles.imageSection}>
                    <Text style={styles.label}>Rasmlar (1-5 tagacha)</Text>
                    <ScrollView
                        horizontal={Boolean(true)}
                        showsHorizontalScrollIndicator={Boolean(false)}
                        style={styles.imageList}
                    >
                        <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                            <Camera color="#7c3aed" size={32} />
                            <Text style={styles.addPhotoText}>Rasm qo'shish</Text>
                        </TouchableOpacity>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.pickedImage} />
                                <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                                    <X color="#fff" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Sarlavha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masalan: Uy suvoqlash..."
                            value={data.title}
                            onChangeText={t => setData({ ...data, title: t })}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1.5 }]}>
                            <Text style={styles.label}>Narxi (so'm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="100 000"
                                keyboardType="numeric"
                                value={data.price}
                                onChangeText={t => setData({ ...data, price: t })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Birlik</Text>
                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerText}>{data.price_type}</Text>
                                <ChevronDown color="#9ca3af" size={16} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategoriya</Text>
                        <View style={styles.categoryGrid}>
                            {filteredCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        data.category_id === cat.id ? styles.activeCategoryCard : null
                                    ]}
                                    onPress={() => setData({ ...data, category_id: cat.id })}
                                >
                                    <Text style={[
                                        styles.categoryCardText,
                                        data.category_id === cat.id ? styles.activeCategoryCardText : null
                                    ]}>{cat.name}</Text>
                                    {data.category_id === cat.id ? (
                                        <CheckCircle color="#fff" size={14} style={styles.checkIcon} />
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Manzil (Shahar/Tuman)</Text>
                        <View style={styles.locationInput}>
                            <MapPin color="#7c3aed" size={20} />
                            <TextInput
                                style={styles.inputInline}
                                placeholder="Masalan: Chirchiq shahri"
                                value={data.location}
                                onChangeText={t => setData({ ...data, location: t })}
                            />
                        </View>
                    </View>

                    <Button
                        title={loading ? "YUKLANMOQDA..." : "PUBLIKATSIYA QILISH"}
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        disabled={Boolean(loading)}
                    />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        padding: 20,
    },
    imageSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    imageList: {
        flexDirection: 'row',
    },
    addPhoto: {
        width: 100,
        height: 100,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ddd6fe',
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addPhotoText: {
        fontSize: 10,
        color: '#7c3aed',
        fontWeight: 'bold',
        marginTop: 4,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 20,
        marginRight: 12,
        position: 'relative',
    },
    pickedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    removeIcon: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ef4444',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    form: {
        gap: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        height: 56,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputInline: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: '#111827',
    },
    locationInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    pickerContainer: {
        height: 56,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '600',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryCard: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeCategoryCard: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    categoryCardText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    activeCategoryCardText: {
        color: '#fff',
    },
    checkIcon: {
        marginLeft: 6,
    },
    submitButton: {
        height: 60,
        borderRadius: 30,
        marginTop: 10,
    },
    deniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    deniedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    deniedText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    deniedButton: {
        width: '100%',
        height: 56,
    }
});

export default PostAdScreen;
