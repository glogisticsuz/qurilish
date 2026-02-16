import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Linking } from 'react-native';
import { Button } from '../components/UIComponents';
import { authApi } from '../api/api';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

const VerifyScreen = ({ route, navigation }) => {
    const { phone } = route.params;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length < 4) {
            Alert.alert('Xato', 'Iltimos, tasdiqlash kodini to\'liq kiriting');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.verify(phone, code);
            if (res.data && res.data.access_token) {
                await RNAsyncStorage.setItem('token', res.data.access_token);
                // Reset navigation to Home
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Root' }],
                });
            } else {
                Alert.alert('Xato', 'Kod noto\'g\'ri');
            }
        } catch (error) {
            console.error('Verify error:', error);
            Alert.alert('Xato', 'Tasdiqlashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Tasdiqlash</Text>
                <Text style={styles.subtitle}>{phone} raqamiga yuborilgan kodni kiriting</Text>

                <TextInput
                    style={styles.input}
                    placeholder="0000"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                    autoFocus={Boolean(true)}
                />

                <Button
                    title={loading ? "Tasdiqlanmoqda..." : "TASDIQLASH"}
                    onPress={handleVerify}
                    style={styles.verifyButton}
                    disabled={Boolean(loading)}
                />

                <Button
                    title="Kod olish (Telegram)"
                    variant="outline"
                    onPress={() => Linking.openURL('https://t.me/MegaStroy_support_bot')}
                    style={styles.telegramButton}
                />

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Raqamni o'zgartirish</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 40,
    },
    input: {
        height: 80,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 10,
        color: '#7c3aed',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 30,
    },
    verifyButton: {
        height: 56,
    },
    telegramButton: {
        marginTop: 10,
        height: 56,
        borderColor: '#0088cc',
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#7c3aed',
        fontWeight: 'bold',
    }
});

export default VerifyScreen;
