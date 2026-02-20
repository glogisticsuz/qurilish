import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

const TermsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Foydalanish shartlari</Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>1. Platformaning roli</Text>
                <Text style={styles.text}>
                    HamkorQurilish — bu qurilish ustalari, texnika egalari va qurilish materiallari yetkazib beruvchilarni mijozlar bilan bog'lovchi onlayn platformadir. Biz xizmat ko'rsatuvchi emasmiz, balki faqat "ulovchi" (connector) vazifasini bajaramiz.
                </Text>

                <Text style={styles.sectionTitle}>2. Mas'uliyatni cheklash</Text>
                <Text style={styles.text}>
                    - HamkorQurilish foydalanuvchilar tomonidan taqdim etilgan ma'lumotlarning aniqligiga va xizmat sifatiga kafolat bermaydi.
                    - Barcha kelishuvlar ikki tomon o'rtasida to'g'ridan-to'g'ri amalga oshiriladi.
                    - Platforma kelishuvlar natijasida yuzaga keladigan moddiy yoki ma'naviy zararlar uchun javobgar emas.
                </Text>

                <Text style={styles.sectionTitle}>3. Foydalanuvchi majburiyatlari</Text>
                <Text style={styles.text}>
                    - Foydalanuvchi o'z e'lonida faqat rost va haqqoniy ma'lumotlarni ko'rsatishi shart.
                    - Platformada odob-axloq qoidalariga zid bo'lgan yoki qonunga xilof harakatlarni amalga oshirish taqiqlanadi.
                </Text>

                <Text style={styles.sectionTitle}>4. Xizmatni to'xtatish</Text>
                <Text style={styles.text}>
                    Platforma qoidalarini buzgan foydalanuvchilar akkaunti ogohlantirishsiz bloklanishi yoki o'chirilishi mumkin.
                </Text>

                <Text style={styles.sectionTitle}>5. Shartlarning o'zgarishi</Text>
                <Text style={styles.text}>
                    HamkorQurilish foydalanish shartlarini istalgan vaqtda o'zgartirish huquqini saqlab qoladi. O'zgarishlar ilova orqali bildiriladi.
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

export default TermsScreen;
