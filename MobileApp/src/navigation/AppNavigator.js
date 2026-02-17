import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Package, MessageCircle, User, PlusCircle } from 'lucide-react-native';
import { View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import VerifyScreen from '../screens/VerifyScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostAdScreen from '../screens/PostAdScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { height: 75, paddingBottom: 12, borderTopWidth: 0, backgroundColor: '#fff', elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
                tabBarActiveTintColor: '#7c3aed',
                tabBarInactiveTintColor: '#9ca3af',
                headerShown: Boolean(false),
                tabBarShowLabel: Boolean(true),
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />,
                    title: 'Asosiy'
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarIcon: ({ color }) => <Package color={color} size={24} />,
                    title: 'Katalog'
                }}
            />
            <Tab.Screen
                name="PostAd"
                component={PostAdScreen}
                options={{
                    tabBarIcon: () => (
                        <View style={{ marginBottom: 25, backgroundColor: '#7c3aed', padding: 14, borderRadius: 22, shadowColor: '#7c3aed', shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 }}>
                            <PlusCircle color="#fff" size={28} />
                        </View>
                    ),
                    tabBarShowLabel: Boolean(false),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('PostAd');
                    },
                })}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
                    title: 'Xabarlar'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <User color={color} size={24} />,
                    title: 'Profil'
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: Boolean(false) }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Verify" component={VerifyScreen} />
                <Stack.Screen name="Root" component={BottomTabs} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="PostAd" component={PostAdScreen} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="Terms" component={TermsScreen} />
                <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
