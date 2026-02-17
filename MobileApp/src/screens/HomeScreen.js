import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl, StatusBar, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Globe, HardHat, Truck, Box, ClipboardList, X, MapPin, ChevronDown, CheckCircle } from 'lucide-react-native';
import { profileApi } from '../api/api';
import { ProductCard, Button } from '../components/UIComponents';
import BannerCarousel from '../components/BannerCarousel';
import { regions } from '../constants/regions';

const categories = [
    { id: 0, name: 'Barchasi', icon: Globe },
    { id: 1, name: 'Ustalar', icon: HardHat },
    { id: 2, name: 'Texnika', icon: Truck },
    { id: 3, name: 'Materiallar', icon: Box },
    { id: 4, name: 'Prorablar', icon: ClipboardList },
    { id: 5, name: 'Ish e\'lonlari', icon: MapPin },
];

const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(regions[0]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [isRegionModalVisible, setIsRegionModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (route.params?.categoryId !== undefined) {
            setActiveCategory(route.params.categoryId);
        }
    }, [route.params?.categoryId]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await profileApi.getAllItems(activeCategory === 0 ? null : activeCategory);
            setItems(res.data || []);
        } catch (error) {
            console.error('Fetch items error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeCategory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    const headerElement = React.useMemo(() => (
        <View>
            {/* Hero Section */}
            <View style={styles.hero}>
                {isSearchOpen ? (
                    <View style={styles.searchHeader}>
                        <View style={styles.searchContainerExpanded}>
                            <TouchableOpacity
                                style={styles.regionSelector}
                                onPress={() => setIsRegionModalVisible(true)}
                            >
                                <MapPin size={16} color="#4b5563" />
                                <Text style={styles.regionText} numberOfLines={1}>
                                    {selectedDistrict ? selectedDistrict : (selectedRegion.id === 'all' ? 'Hudud' : selectedRegion.name.replace(' viloyati', '').replace(' shahri', ''))}
                                </Text>
                                <ChevronDown size={14} color="#4b5563" />
                            </TouchableOpacity>
                            <View style={styles.searchDivider} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Qidirish..."
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={isSearchOpen}
                            />
                            <TouchableOpacity onPress={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                            }}>
                                <X color="#6b7280" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.heroTitle}>MegaStroy</Text>
                            <Text style={styles.heroSubtitle}>Barcha qurilish xizmatlari bir joyda</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={() => setIsSearchOpen(true)}
                        >
                            <Search color="#7c3aed" size={24} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Banner Carousel */}
            <BannerCarousel />

            {/* Categories */}
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryButton,
                            activeCategory === cat.id ? styles.activeCategoryButton : null
                        ]}
                        onPress={() => setActiveCategory(cat.id)}
                    >
                        <cat.icon
                            size={18}
                            color={activeCategory === cat.id ? '#fff' : '#7c3aed'}
                        />
                        <Text style={[
                            styles.categoryText,
                            activeCategory === cat.id ? styles.activeCategoryText : null
                        ]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {searchQuery ? "Qidiruv natijalari" : "Oxirgi e'lonlar"}
                </Text>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isRegionModalVisible}
                onRequestClose={() => setIsRegionModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Hududni tanlang</Text>
                            <TouchableOpacity onPress={() => setIsRegionModalVisible(false)}>
                                <X color="#111827" size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedRegion.id !== 'all' && (
                            <TouchableOpacity
                                style={styles.backToRegions}
                                onPress={() => {
                                    setSelectedRegion(regions[0]);
                                    setSelectedDistrict(null);
                                }}
                            >
                                <ChevronDown size={20} color="#7c3aed" style={{ transform: [{ rotate: '90deg' }] }} />
                                <Text style={styles.backToRegionsText}>Barcha hududlar</Text>
                            </TouchableOpacity>
                        )}

                        <FlatList
                            data={selectedRegion.id === 'all' ? regions : [selectedRegion, ...selectedRegion.districts.map(d => ({ id: d, name: d, isDistrict: true }))]}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                if (item.isDistrict) {
                                    return (
                                        <TouchableOpacity
                                            style={styles.regionItem}
                                            onPress={() => {
                                                setSelectedDistrict(item.name);
                                                setIsRegionModalVisible(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.regionItemText,
                                                styles.districtItemText,
                                                selectedDistrict === item.name && styles.selectedRegionText
                                            ]}>
                                                {item.name}
                                            </Text>
                                            {selectedDistrict === item.name && (
                                                <CheckCircle size={20} color="#7c3aed" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }

                                return (
                                    <TouchableOpacity
                                        style={styles.regionItem}
                                        onPress={() => {
                                            if (item.id === 'all') {
                                                setSelectedRegion(item);
                                                setSelectedDistrict(null);
                                                setIsRegionModalVisible(false);
                                            } else {
                                                setSelectedRegion(item);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.regionItemText,
                                            selectedRegion.id === item.id && styles.selectedRegionText
                                        ]}>
                                            {item.name}
                                        </Text>
                                        {selectedRegion.id === item.id && !selectedDistrict && (
                                            <MapPin size={20} color="#7c3aed" />
                                        )}
                                        {item.id !== 'all' && selectedRegion.id !== item.id && (
                                            <ChevronDown size={20} color="#9ca3af" style={{ transform: [{ rotate: '-90deg' }] }} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        {selectedRegion.id !== 'all' && (
                            <Button
                                title={`${selectedRegion.name} bo'yicha qidirish`}
                                onPress={() => setIsRegionModalVisible(false)}
                                style={{ marginTop: 10 }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    ), [isSearchOpen, selectedRegion, selectedDistrict, searchQuery, activeCategory, isRegionModalVisible]);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = selectedRegion.id === 'all' ||
            item.profile?.region?.toLowerCase().includes(selectedRegion.name.replace(' viloyati', '').replace(' shahri', '').toLowerCase()) ||
            item.location?.toLowerCase().includes(selectedRegion.name.replace(' viloyati', '').replace(' shahri', '').toLowerCase());

        return matchesSearch && matchesRegion;
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            title={item.title}
                            price={item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan'}
                            location={item.location || item.profile?.region || 'O\'zbekiston'}
                            image={item.image_url1}
                            ownerName={item.profile?.full_name || 'Foydalanuvchi'}
                            isVerified={Boolean(item.profile?.is_verified)}
                            description={item.description}
                            onClick={() => navigation.navigate('ProductDetail', {
                                item: {
                                    ...item,
                                    image: item.image_url1,
                                    price: item.price ? `${item.price.toLocaleString()} so'm` : 'Kelishilgan',
                                    location: item.location || item.profile?.region || 'O\'zbekiston',
                                    ownerName: item.profile?.full_name || 'Foydalanuvchi',
                                    isVerified: Boolean(item.profile?.is_verified),
                                    userId: item.profile?.user_id,
                                    description: item.description,
                                    phone: item.phone,
                                    profile: item.profile
                                }
                            })}
                        />
                    </View>
                )}
                ListHeaderComponent={headerElement}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#7c3aed"
                        colors={['#7c3aed']}
                    />
                }
                ListEmptyComponent={
                    loading === false ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Ma'lumot topilmadi</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    hero: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 20,
        paddingVertical: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#ddd6fe',
        marginTop: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
    },
    searchButton: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchHeader: {
        paddingBottom: 20,
        height: 80,
        justifyContent: 'center',
    },
    searchContainerExpanded: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 50,
    },
    regionSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
        maxWidth: 100,
    },
    regionText: {
        fontSize: 14,
        color: '#4b5563',
        marginHorizontal: 4,
        fontWeight: '500',
    },
    searchDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e5e7eb',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        marginRight: 10,
    },
    modalContainer: {
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
    regionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    regionItemText: {
        fontSize: 16,
        color: '#4b5563',
    },
    districtItemText: {
        fontSize: 15,
        marginLeft: 20,
    },
    selectedRegionText: {
        color: '#7c3aed',
        fontWeight: 'bold',
    },
    backToRegions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    backToRegionsText: {
        fontSize: 14,
        color: '#7c3aed',
        fontWeight: '600',
        marginLeft: 4,
    },
    categoryScroll: {
        marginVertical: 15,
    },
    categoryContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginRight: 8,
    },
    activeCategoryButton: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#4b5563',
    },
    activeCategoryText: {
        color: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
    },
    listContent: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    cardWrapper: {
        width: '48%',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    }
});

export default HomeScreen;
