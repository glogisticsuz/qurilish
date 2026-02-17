import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
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
    login: (phone, role) => api.post('/auth/login', { phone, role }),
    verify: (phone, otp_code) => api.post('/auth/verify', { phone, otp_code }),
    getMe: () => api.get('/users/me'),
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
    markAsRead: (userId) => api.post(`/messages/${userId}/read`),
};

export const reviewApi = {
    getReviews: (userId) => api.get(`/reviews/${userId}`),
    addReview: (userId, data) => api.post(`/reviews/${userId}`, data),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getUnverified: () => api.get('/admin/unverified'),
    verifyProfile: (profileId) => api.post(`/admin/profiles/${profileId}/verify`),
};

export default api;
