import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => {
        console.error('[API REQUEST ERROR]', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        const isAuthCheck = error.config?.url?.includes('/users/profile') || error.config?.url?.includes('/users/bookmarks/all');
        if (error.response?.status === 401 && isAuthCheck) {
            // Suppress noise for expected auth checks
            return Promise.reject(error);
        }

        console.error(`[API ERROR] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
