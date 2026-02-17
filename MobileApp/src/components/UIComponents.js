import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, Dimensions } from 'react-native';
import { Star, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const Button = ({ title, onPress, variant = 'primary', style }) => (
    <TouchableOpacity
        style={[styles.button, styles[variant], style]}
        onPress={onPress}
    >
        <Text style={[styles.buttonText, variant === 'outline' ? styles.outlineText : null]}>
            {title}
        </Text>
    </TouchableOpacity>
);

export const ProductCard = ({ title, price, location, image, ownerName, isVerified, description, onClick }) => (
    <TouchableOpacity style={styles.card} onPress={onClick}>
        <Image source={{ uri: image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
            <Text style={styles.cardPrice}>{price}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            {description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {description}
                </Text>
            ) : null}
            <View style={styles.cardFooter}>
                <Text style={styles.cardLocation}>{location}</Text>
            </View>
            <View style={styles.ownerRow}>
                <Text style={styles.ownerName}>{ownerName}</Text>
                {Boolean(isVerified) ? <ShieldCheck color="#7c3aed" size={14} fill="#ddd6fe" /> : null}
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: '#7c3aed',
    },
    secondary: {
        backgroundColor: '#10b981',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#7c3aed',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    outlineText: {
        color: '#7c3aed',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: (width - 48) / 2,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#f3f4f6',
    },
    cardContent: {
        padding: 10,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: '#7c3aed',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
        marginVertical: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#4b5563',
        marginVertical: 4,
        lineHeight: 16,
    },
    cardLocation: {
        fontSize: 10,
        color: '#6b7280',
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 6,
    },
    ownerName: {
        fontSize: 10,
        color: '#4b5563',
        marginRight: 4,
        fontWeight: '600',
    }
});
