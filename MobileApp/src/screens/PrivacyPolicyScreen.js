import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

const PrivacyPolicyScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Maxfiylik siyosati</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>1. Ma'lumotlarni to'plash</Text>
                <Text style={styles.text}>
                    HamkorQurilish ilovasi orqali biz sizning telefon raqamingiz, ismingiz va profilingiz uchun tanlangan hudud ma'lumotlarini to'playmiz. Bu sizga sifatli xizmat ko'rsatish va boshqa foydalanuvchilar bilan bog'lanish uchun zarurdir.
                </Text>

                <Text style={styles.sectionTitle}>2. Ma'lumotlardan foydalanish</Text>
                <Text style={styles.text}>
                    To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:
                    - Akkauntingizni identifikatsiya qilish;
                    - E'lonlaringizni joylashtirish va ko'rsatish;
                    - Qurilish ustalari va mijozlar o'rtasida aloqa o'rnatish.
                </Text>

                <Text style={styles.sectionTitle}>3. Ma'lumotlarni himoya qilish</Text>
                <Text style={styles.text}>
                    Biz sizning shaxsiy ma'lumotlaringizni ruxsatsiz kirishdan himoya qilish uchun zamonaviy xavfsizlik choralarini qo'llaymiz. Telefon raqamingiz faqat siz e'lon berganingizda yoki xabarlar orqali ko'rinadi.
                </Text>

                <Text style={styles.sectionTitle}>4. Uchinchi tomonlar</Text>
                <Text style={styles.text}>
                    HamkorQurilish sizning shaxsiy ma'lumotlaringizni uchinchi tomonlarga sotmaydi yoki ijaraga bermaydi.
                </Text>

                <Text style={styles.sectionTitle}>5. Maxfiylikni boshqarish</Text>
                <Text style={styles.text}>
                    Siz istalgan vaqtda profil sozlamalari orqali ma'lumotlaringizni tahrirlashingiz yoki akkauntingizni o'chirishingiz mumkin.
                </Text>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7c3aed',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 24,
    },
});

export default PrivacyPolicyScreen;
