import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const api = axios.create({
    baseURL: API_URL,
    timeout: 300000,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('Axios Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
        });
        if (error.response && error.response.status === 401) {
            await AsyncStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (phone, role) => api.post('/auth/login', { phone, role }),
    verify: (phone, otp_code) => api.post('/auth/verify', { phone, otp_code }),
    getMe: () => api.get('/users/me'),
    updateRole: (role) => api.put('/users/role', { role }),
};

export const profileApi = {
    getMe: () => api.get('/profiles/me'),
    updateMe: (data) => api.put('/profiles/me', data),
    uploadAvatar: (formData) => api.post('/profiles/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getPublicProfile: (userId) => api.get(`/profiles/${userId}`),
    getUserPortfolio: (userId) => api.get(`/profiles/${userId}/portfolio`),
    getMyPortfolio: () => api.get('/profiles/me/portfolio'),
    uploadPortfolio: (formData) => api.post('/api/profile/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAllItems: (category_id) => api.get('/api/items', { params: { category_id } }),
    deletePortfolio: (itemId) => api.delete(`/api/items/${itemId}`),
    updatePortfolio: (itemId, formData) => api.put(`/api/items/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const chatApi = {
    getChats: () => api.get('/messages/chats'),
    getHistory: (userId) => api.get(`/messages/${userId}`),
    sendMessage: (data) => api.post('/messages/send', data),
    sendImage: (formData) => api.post('/messages/send-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const reviewApi = {
    getReviews: (userId) => api.get(`/reviews/${userId}`),
    addReview: (userId, data) => api.post(`/reviews/${userId}`, data),
};

export default api;
