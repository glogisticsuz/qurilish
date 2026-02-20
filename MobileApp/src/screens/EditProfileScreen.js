import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Save, User, MapPin, ChevronDown, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { profileApi, authApi } from '../api/api';
import { Button } from '../components/UIComponents';
import { regions } from '../constants/regions';

const EditProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        full_name: '',
        phone: '',
        region: '',
        district: '',
        avatar_url: null,
        bio: '',
        phone: '',
    });
    // Role field removed to avoid confusion
    const [isRegionModalVisible, setIsRegionModalVisible] = useState(false);
    const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, userRes] = await Promise.all([
                profileApi.getMe(),
                authApi.getMe()
            ]);
            setData({
                full_name: profileRes.data.full_name || '',
                region: profileRes.data.region || '',
                district: profileRes.data.district || '',
                avatar_url: profileRes.data.avatar_url,
                bio: profileRes.data.bio || '',
                phone: userRes.data.phone || '',
            });
        } catch (error) {
            console.error('Fetch profile error:', error);
            Alert.alert('Xato', 'Profil ma\'lumotlarini yuklashda xatolik');
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
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri) => {
        setLoading(true);
        const formData = new FormData();
        const fileName = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('file', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: fileName,
            type: type,
        });

        try {
            const res = await profileApi.uploadAvatar(formData);
            setData(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
            Alert.alert('Muvaffaqiyat', 'Rasm yangilandi');
        } catch (error) {
            console.error('Upload avatar error:', error);
            Alert.alert('Xato', 'Rasmni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!data.full_name) {
            Alert.alert('Xato', 'Ismingizni kiriting');
            return;
        }

        setLoading(true);
        try {
            await profileApi.updateMe({
                full_name: data.full_name,
                region: data.region,
                district: data.district,
                bio: data.bio,
            });
            Alert.alert('Muvaffaqiyat', 'Profil saqlandi', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Xato', 'Saqlashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handleRegionSelect = (region) => {
        setData({ ...data, region: region.name, district: '' });
        setIsRegionModalVisible(false);
        if (region.districts && region.districts.length > 0) {
            setIsDistrictModalVisible(true);
        }
    };

    const handleDistrictSelect = (district) => {
        setData({ ...data, district: district });
        setIsDistrictModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profilni tahrirlash</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {data.avatar_url ? (
                            <Image source={{ uri: data.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Camera color="#9ca3af" size={32} />
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Camera color="#fff" size={14} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Rasmni o'zgartirish</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ism Familiya</Text>
                        <View style={styles.inputContainer}>
                            <User color="#9ca3af" size={20} />
                            <TextInput
                                style={styles.input}
                                value={data.full_name}
                                onChangeText={t => setData({ ...data, full_name: t })}
                                placeholder="Ismingizni kiriting"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefon raqami (O'zgartirib bo'lmaydi)</Text>
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                            <Text style={styles.disabledText}>{data.phone || 'Yuklanmoqda...'}</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hudud</Text>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setIsRegionModalVisible(true)}
                        >
                            <MapPin color="#9ca3af" size={20} />
                            <Text style={[styles.input, !data.region && { color: '#9ca3af' }]}>
                                {data.region || "Hududni tanlang"}
                            </Text>
                            <ChevronDown color="#9ca3af" size={20} />
                        </TouchableOpacity>
                    </View>

                    {data.region ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tuman / Shahar</Text>
                            <TouchableOpacity
                                style={styles.inputContainer}
                                onPress={() => setIsDistrictModalVisible(true)}
                            >
                                <MapPin color="#9ca3af" size={20} />
                                <Text style={[styles.input, !data.district && { color: '#9ca3af' }]}>
                                    {data.district || "Tumanni tanlang"}
                                </Text>
                                <ChevronDown color="#9ca3af" size={20} />
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* Show Bio only for Pros and Suppliers (optional choice, user said "coustmerdan boshqa larni rasmini tagida biosi bolsin") */}
                    {/* But we allow everyone to edit Bio, just show it on Detail screen for non-customers if needed */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>O'zingiz haqingizda (Bio)</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                            value={data.bio}
                            onChangeText={t => setData({ ...data, bio: t })}
                            placeholder="Mutaxassisligingiz va tajribangiz haqida yozing"
                            multiline={true}
                            maxLength={1000}
                        />
                        <Text style={styles.helperText}>{data.bio.length}/1000</Text>
                    </View>

                    <Button
                        title={loading ? "SAQLANMOQDA..." : "SAQLASH"}
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={loading}
                        icon={<Save color="#fff" size={20} />}
                    />
                </View>
            </ScrollView>

            {/* Region Selection Modal */}
            <Modal
                visible={isRegionModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsRegionModalVisible(false)}
            >
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
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleRegionSelect(item)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        data.region === item.name && styles.selectedItemText
                                    ]}>{item.name}</Text>
                                    {data.region === item.name && (
                                        <Check color="#7c3aed" size={20} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* District Selection Modal */}
            <Modal
                visible={isDistrictModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDistrictModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tumanni tanlang</Text>
                            <TouchableOpacity onPress={() => setIsDistrictModalVisible(false)}>
                                <X color="#111827" size={24} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={regions.find(r => r.name === data.region)?.districts || []}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleDistrictSelect(item)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        data.district === item && styles.selectedItemText
                                    ]}>{item}</Text>
                                    {data.district === item && (
                                        <Check color="#7c3aed" size={20} />
                                    )}
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
        flex: 1,
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f3f4f6',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7c3aed',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    changePhotoText: {
        color: '#7c3aed',
        fontWeight: '600',
        fontSize: 14,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    saveButton: {
        marginTop: 20,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
    },
    disabledText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    helperText: {
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
        maxHeight: '80%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f9fafb',
    },
    modalItemText: {
        fontSize: 16,
        color: '#374151',
    },
    selectedItemText: {
        color: '#7c3aed',
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
