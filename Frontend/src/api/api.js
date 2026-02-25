import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
    const isAdminPath = config.url.includes('/api/admin');
    const token = localStorage.getItem(isAdminPath ? 'admin_token' : 'token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (phone, role) => api.post('/api/auth/login', { phone, role }),
    verify: (phone, otp_code) => api.post('/api/auth/verify', { phone, otp_code }),
    getMe: () => api.get('/api/users/me'),
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
    getChats: () => api.get('/api/messages/chats'),
    getHistory: (userId) => api.get(`/api/messages/${userId}`),
    sendMessage: (data) => api.post('/api/messages/send', data),
    sendImage: (formData) => api.post('/api/messages/send-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    markAsRead: (userId) => api.post(`/api/messages/${userId}/read`),
};

export const reviewApi = {
    getReviews: (userId) => api.get(`/api/reviews/${userId}`),
    addReview: (userId, data) => api.post(`/api/reviews/${userId}`, data),
};

export const adminApi = {
    login: (username, password) => api.post('/api/admin/login', { username, password }),
    getStatsOverview: () => api.get('/api/admin/stats/overview'),
    getAds: () => api.get('/api/admin/ads'),
    getAdStats: () => api.get('/api/admin/stats/ads'),
    updateAd: (adId, is_active) => api.put(`/api/admin/ads/${adId}`, null, { params: { is_active } }),
    deleteAd: (adId) => api.delete(`/api/admin/ads/${adId}`),
    createAd: (formData) => api.post('/api/admin/ads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getUnverified: () => api.get('/api/admin/unverified'),
    verifyProfile: (profileId) => api.post(`/api/admin/profiles/${profileId}/verify`),
};

export default api;
