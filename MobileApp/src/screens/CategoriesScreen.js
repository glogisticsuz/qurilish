import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { HardHat, Truck, Box, ClipboardList, ChevronRight } from 'lucide-react-native';

const CATEGORIES = [
    { id: 1, name: 'Ustalar', icon: HardHat, color: '#7c3aed', count: '1,240' },
    { id: 2, name: 'Texnika Ijarasi', icon: Truck, color: '#10b981', count: '450' },
    { id: 3, name: 'Qurilish Mollari', icon: Box, color: '#f59e0b', count: '2,100' },
    { id: 4, name: 'Prorablar', icon: ClipboardList, color: '#3b82f6', count: '180' },
];

const CategoriesScreen = ({ navigation }) => {
    const renderItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Home', { categoryId: item.id })}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Icon color={item.color} size={28} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.count}>{item.count} ta e'lon</Text>
                </View>
                <ChevronRight color="#9ca3af" size={20} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Katalog</Text>
                <Text style={styles.subtitle}>Barcha turdagi xizmatlar va mahsulotlar</Text>
            </View>
            <FlatList
                data={CATEGORIES}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={Boolean(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#f9fafb',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    list: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    count: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    }
});

export default CategoriesScreen;
