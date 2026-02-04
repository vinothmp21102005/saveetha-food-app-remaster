import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Sending ${config.method.toUpperCase()} request to ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error("Axios Request Error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`Received response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error("Axios Response Error:", error.response ? error.response.data : error.message);
        return Promise.reject(error);
    }
);

export default api;
