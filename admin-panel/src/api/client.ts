import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Interceptor para adicionar token admin
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de resposta
apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_info');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default apiClient;