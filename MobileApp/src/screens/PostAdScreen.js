import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, MapPin, ChevronDown, CheckCircle, X, Layers, DollarSign, Phone, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { profileApi, authApi } from '../api/api';
import { Button } from '../components/UIComponents';
import { regions } from '../constants/regions';

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
    const [selectedRegion, setSelectedRegion] = useState(null);

    const priceTypes = [
        { id: 'soat', name: 'soat' },
        { id: 'kun', name: 'kun' },
        { id: 'kv_metr', name: 'kv. metr' },
        { id: 'tochka', name: 'tochka' },
        { id: 'xizmat', name: 'xizmat' },
    ];

    const categories = [
        { id: 1, name: 'Ustalar', role: 'pro', icon: '👷' },
        { id: 2, name: 'Texnika Ijarasi', role: 'supplier', icon: '🚜' },
        { id: 3, name: 'Qurilish Mollari', role: 'supplier', icon: '🧱' },
        { id: 4, name: 'Prorablar', role: 'pro', icon: '📋' },
        { id: 5, name: 'Ish e\'lonlari', role: 'customer', icon: '💼' },
        { id: 6, name: 'Boshqa xizmatlar', role: 'pro', icon: '🛠️' }
    ];

    useFocusEffect(
        React.useCallback(() => {
            authApi.getMe().then(res => {
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

    const filteredCategories = categories.filter(c =>
        c.role === user?.role?.toLowerCase() ||
        user?.role?.toLowerCase() === 'admin' ||
        (user?.role?.toLowerCase() === 'customer' && c.role === 'customer')
    );

    const handleSubmit = async () => {
        if (!data.title) return Alert.alert('Xato', 'Sarlavhani kiriting');
        if (!data.category_id) return Alert.alert('Xato', 'Kategoriyani tanlang');
        if (images.length === 0) return Alert.alert('Xato', 'Kamida bitta rasm yuklang');

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
            Alert.alert('Xato', 'E\'lonni yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yangi e'lon</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Media Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Camera color="#7c3aed" size={16} />
                        <Text style={styles.sectionTitle}>Rasmlar va Media</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaList}>
                        <TouchableOpacity style={styles.addMedia} onPress={pickImage}>
                            <Camera color="#7c3aed" size={32} />
                            <Text style={styles.addMediaText}>Rasm qo'shish</Text>
                            <Text style={styles.mediaCount}>{images.length}/5</Text>
                        </TouchableOpacity>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.mediaItem}>
                                <Image source={{ uri }} style={styles.imageThumb} />
                                <TouchableOpacity style={styles.removeMedia} onPress={() => removeImage(index)}>
                                    <X color="#fff" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <Text style={styles.mediaHint}>Birinchi rasm asosiy bo'ladi</Text>
                </View>

                {/* Info Section */}
                <View style={[styles.section, styles.whiteCard]}>
                    <View style={styles.sectionHeader}>
                        <Layers color="#7c3aed" size={16} />
                        <Text style={styles.sectionTitle}>Asosiy ma'lumotlar</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Sarlavha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Kran ijarasi, Suvoqchi xizmati..."
                            placeholderTextColor="#9ca3af"
                            value={data.title}
                            onChangeText={t => setData({ ...data, title: t })}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Kategoriya</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPicker}>
                            {filteredCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catItem, data.category_id === cat.id && styles.catItemActive]}
                                    onPress={() => setData({ ...data, category_id: cat.id })}
                                >
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                    <Text style={[styles.catText, data.category_id === cat.id && styles.catTextActive]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Price Section */}
                <View style={[styles.section, styles.whiteCard]}>
                    <View style={styles.sectionHeader}>
                        <DollarSign color="#7c3aed" size={16} />
                        <Text style={styles.sectionTitle}>Narx va manzil</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1.5 }]}>
                            <Text style={styles.inputLabel}>Narxi (So'm)</Text>
                            <TextInput
                                style={[styles.input, styles.priceInput]}
                                placeholder="100,000"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={data.price}
                                onChangeText={t => setData({ ...data, price: t })}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Turi</Text>
                            <View style={styles.selectWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="soat, kun..."
                                    placeholderTextColor="#9ca3af"
                                    value={data.price_type}
                                    onChangeText={t => setData({ ...data, price_type: t })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Manzil (Hudud)</Text>
                        <TouchableOpacity
                            style={styles.pickerTrigger}
                            onPress={() => setIsRegionModalVisible(true)}
                        >
                            <MapPin color="#7c3aed" size={18} />
                            <Text style={[styles.pickerText, !data.location && { color: '#9ca3af' }]}>
                                {data.location || "Hududni tanlang"}
                            </Text>
                            <ChevronDown color="#9ca3af" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contacts Section */}
                <View style={[styles.section, styles.whiteCard]}>
                    <View style={styles.sectionHeader}>
                        <Phone color="#7c3aed" size={16} />
                        <Text style={styles.sectionTitle}>Aloqa va batafsil</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Telefon raqami</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+998 90 123 45 67"
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            value={data.phone}
                            onChangeText={t => setData({ ...data, phone: t })}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Tavsif (Ixtiyoriy)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Ish yoki xizmat haqida batafsil ma'lumot qoldiring..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            value={data.description}
                            onChangeText={t => setData({ ...data, description: t })}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitBtnText}>
                        {loading ? "YUKLANMOQDA..." : "E'LONNI JOYLASHTIRISH"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Region Selection Modals */}
            <Modal visible={isRegionModalVisible} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
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
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setSelectedRegion(item);
                                        setIsRegionModalVisible(false);
                                        setIsDistrictModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={isDistrictModalVisible} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
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
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setData({ ...data, location: `${selectedRegion.name}, ${item}` });
                                        setIsDistrictModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{item}</Text>
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
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: { padding: 8, marginRight: 8 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 60 },
    section: { marginBottom: 24 },
    whiteCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5 },
    mediaList: { flexDirection: 'row' },
    addMedia: {
        width: 100, height: 100, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed',
        borderColor: '#ddd6fe', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    addMediaText: { fontSize: 10, color: '#7c3aed', fontWeight: '900', marginTop: 4 },
    mediaCount: { fontSize: 9, color: '#a5b4fc', fontWeight: 'bold' },
    mediaItem: { width: 100, height: 100, borderRadius: 20, marginRight: 12, position: 'relative' },
    imageThumb: { width: '100%', height: '100%', borderRadius: 20 },
    removeMedia: {
        position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444',
        width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
    },
    mediaHint: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold', marginTop: 8, paddingLeft: 4 },
    inputWrapper: { marginBottom: 16 },
    inputLabel: { fontSize: 11, fontWeight: '900', color: '#111827', marginBottom: 8, marginLeft: 4, opacity: 0.6 },
    input: {
        height: 54, backgroundColor: '#f9fafb', borderRadius: 16, paddingHorizontal: 16, borderColors: '#f3f4f6',
        fontSize: 16, fontWeight: '600', color: '#111827'
    },
    priceInput: { color: '#7c3aed', fontWeight: '900' },
    row: { flexDirection: 'row', gap: 12 },
    textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
    catPicker: { flexDirection: 'row', marginHorizontal: -4 },
    catItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', paddingHorizontal: 12,
        paddingVertical: 10, borderRadius: 14, marginRight: 8, borderContent: '#f3f4f6', borderWidth: 1
    },
    catItemActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
    catIcon: { fontSize: 16, marginRight: 6 },
    catText: { fontSize: 13, fontWeight: 'bold', color: '#4b5563' },
    catTextActive: { color: '#fff' },
    pickerTrigger: {
        flexDirection: 'row', alignItems: 'center', height: 54, backgroundColor: '#f9fafb',
        borderRadius: 16, paddingHorizontal: 16, gap: 12
    },
    pickerText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
    submitBtn: {
        height: 60, backgroundColor: '#10b981', borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        marginTop: 12, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
    },
    submitBtnDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
    submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
    modalOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#4b5563' },
});

export default PostAdScreen;
