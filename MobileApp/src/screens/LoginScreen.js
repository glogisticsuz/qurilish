import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, Alert, Linking, TouchableOpacity } from 'react-native';
import { Button } from '../components/UIComponents';
import { authApi } from '../api/api';

const LoginScreen = ({ navigation }) => {
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone) {
            Alert.alert('Xato', 'Iltimos, telefon raqamingizni kiriting');
            return;
        }
        setLoading(true);
        try {
            console.log('Logging in with:', { phone, role }); // Debug log
            await authApi.login(phone, role);
            navigation.navigate('Verify', { phone });
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Xato', 'Kirishda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>M</Text>
                    </View>
                    <Text style={styles.title}>MegaStroy</Text>
                    <Text style={styles.subtitle}>Platformaga xush kelibsiz</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Telefon raqamingiz</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+998 90 123 45 67"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>Sizning rolingiz</Text>
                    <View style={styles.roleContainer}>
                        {['customer', 'pro', 'supplier'].map((r) => (
                            <Button
                                key={r}
                                title={r === 'customer' ? 'Mijoz' : r === 'pro' ? 'Usta' : 'Texnika'}
                                variant={role === r ? 'primary' : 'outline'}
                                style={styles.roleButton}
                                onPress={() => setRole(r)}
                            />
                        ))}
                    </View>

                    <Button
                        title={loading ? "Yuborilmoqda..." : "KIRISH"}
                        onPress={handleLogin}
                        style={styles.loginButton}
                        disabled={loading === true}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Kirish orqali siz bizning </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                        <Text style={styles.link}>Foydalanish shartlari</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}> va </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                        <Text style={styles.link}>Maxfiylik siyosati</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}>ga rozilik berasiz.</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 60,
        height: 60,
        backgroundColor: '#7c3aed',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    form: {
        gap: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: -12,
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
    roleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 10,
    },
    loginButton: {
        marginTop: 10,
        height: 56,
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    link: {
        fontSize: 12,
        color: '#7c3aed',
        fontWeight: 'bold',
    }
});

export default LoginScreen;
