import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, MapPin, ChevronDown, CheckCircle, X, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { profileApi, authApi } from '../api/api';
import { Button } from '../components/UIComponents';
import { regions } from '../constants/regions';
import { Modal, FlatList } from 'react-native';

const PostAdScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        title: '',
        price: '',
        price_type: 'soat',
        category_id: null,
        location: '',
        description: '',
        phone: '',
        item_type: 'service',
    });
    const [images, setImages] = useState([]);
    const [isRegionModalVisible, setIsRegionModalVisible] = useState(false);
    const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);
    const [isPriceTypeModalVisible, setIsPriceTypeModalVisible] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);

    const priceTypes = [
        { id: 'soat', name: 'soat' },
        { id: 'kun', name: 'kun' },
        { id: 'kv_metr', name: 'kv. metr' },
        { id: 'tochka', name: 'tochka (nuqta)' },
        { id: 'kub_metr', name: 'kub metr' },
        { id: 'dona', name: 'dona' },
        { id: 'xizmat', name: 'xizmat (umumiy)' },
    ];

    const categories = [
        { id: 1, name: 'Ustalar', role: 'pro' },
        { id: 2, name: 'Texnika Ijarasi', role: 'supplier' },
        { id: 3, name: 'Qurilish Mollari', role: 'supplier' },
        { id: 4, name: 'Prorablar', role: 'pro' },
        { id: 5, name: 'Ish e\'lonlari', role: 'customer' },
    ];

    useFocusEffect(
        React.useCallback(() => {
            authApi.getMe().then(res => {
                console.log('Refetched User:', res.data);
                setUser(res.data);

                const userRole = res.data.role?.toLowerCase();
                const filtered = categories.filter(c => c.role === userRole);

                if (filtered.length > 0 && !data.category_id) {
                    setData(prev => ({
                        ...prev,
                        category_id: filtered[0].id,
                        phone: res.data.phone || '',
                        item_type: userRole === 'customer' ? 'job_request' : 'service'
                    }));
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
            mediaTypes: ['images'],
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

    const filteredCategories = categories.filter(c => c.role === user?.role?.toLowerCase());

    const handleSubmit = async () => {
        console.log('Submitting Data:', data);
        console.log('Images Count:', images.length);

        if (!data.title) {
            Alert.alert('Xato', 'Sarlavhani kiriting');
            return;
        }
        if (!data.category_id) {
            Alert.alert('Xato', 'Kategoriyani tanlang (Ustalar, Texnika, va h.k.)');
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
        formData.append('description', data.description);
        formData.append('phone', data.phone);
        formData.append('item_type', data.item_type);

        images.forEach((img, index) => {
            const fileName = img.split('/').pop();
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('files', {
                uri: Platform.OS === 'android' ? img : img.replace('file://', ''),
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

    // Customer restriction removed: they can now post job requests

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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Narxi va o'lchov birligi</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1.5 }]}
                                placeholder="Masalan: 50,000"
                                keyboardType="numeric"
                                value={data.price}
                                onChangeText={t => setData({ ...data, price: t })}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1.2 }]}
                                placeholder="soat, kv, kun..."
                                value={data.price_type}
                                onChangeText={t => setData({ ...data, price_type: t })}
                            />
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
                        <Text style={styles.label}>To'liq ma'lumot (Tavsif)</Text>
                        <TextInput
                            style={[styles.input, { height: 120, textAlignVertical: 'top', paddingTop: 12 }]}
                            placeholder="Ish e'loni yoki xizmat haqida to'liqroq ma'lumot bering..."
                            value={data.description}
                            onChangeText={t => setData({ ...data, description: t })}
                            multiline={true}
                            maxLength={1000}
                        />
                        <Text style={styles.charCount}>{data.description.length}/1000</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Aloqa uchun telefon</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+998 90 123 45 67"
                            keyboardType="phone-pad"
                            value={data.phone}
                            onChangeText={t => setData({ ...data, phone: t })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Manzil (Hudud)</Text>
                        <TouchableOpacity
                            style={styles.locationInput}
                            onPress={() => setIsRegionModalVisible(true)}
                        >
                            <MapPin color="#7c3aed" size={20} />
                            <Text style={[styles.inputInline, !data.location && { color: '#9ca3af' }]}>
                                {data.location || "Hududni tanlang"}
                            </Text>
                            <ChevronDown color="#9ca3af" size={16} />
                        </TouchableOpacity>
                    </View>

                    <Button
                        title={loading ? "YUKLANMOQDA..." : "PUBLIKATSIYA QILISH"}
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        disabled={Boolean(loading)}
                    />
                </View>
            </ScrollView>

            {/* Region Modal */}
            <Modal visible={isRegionModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Hududni tanlang</Text>
                            <TouchableOpacity onPress={() => setIsRegionModalVisible(false)}>
                                <X color="#111827" size={24} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={regions.filter(r => r.id !== 'all')}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedRegion(item);
                                        setIsRegionModalVisible(false);
                                        setIsDistrictModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* District Modal */}
            <Modal visible={isDistrictModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tumanni tanlang</Text>
                            <TouchableOpacity onPress={() => setIsDistrictModalVisible(false)}>
                                <X color="#111827" size={24} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={selectedRegion?.districts || []}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setData({ ...data, location: `${selectedRegion.name}, ${item}` });
                                        setIsDistrictModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
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
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalItemText: {
        fontSize: 16,
        color: '#4b5563',
    },
});

export default PostAdScreen;
