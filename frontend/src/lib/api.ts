import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('ems_user') || '{}');
    // Assuming we might have a token in the future, for now using dummy logic or 
    // reliance on session/cookies if backend supports it.
    // If backend uses JWT, we would get it from localStorage.
    const token = localStorage.getItem('ems_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const attendanceApi = {
    getAll: () => api.get('/attendance'),
    checkIn: () => api.post('/attendance/check-in'),
    checkOut: () => api.post('/attendance/check-out'),
};

export const leaveApi = {
    getAll: () => api.get('/leave'),
    apply: (data: { type: string; startDate: string; endDate: string; reason: string }) => api.post('/leave', data),
};

export const employeeApi = {
    getMe: () => api.get('/employee/me'), // Assuming this endpoint exists or similar
    getProfile: (id: string) => api.get(`/employee/${id}`),
};

export const payrollApi = {
    getMyPayslips: () => api.get('/payroll'), // The backend controller handles role filtering automatically
};

export default api;
