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
    async (error) => {
        const originalRequest = error.config;
        
        const isAuthCheck = originalRequest?.url?.includes('/users/profile') || originalRequest?.url?.includes('/users/bookmarks/all');

        // Handle 401 Unauthorized for token refresh
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                await api.post('/auth/refresh');
                
                // If successful, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (e.g. refresh token expired), it will just reject and UI handles it (e.g. redirect to login)
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && isAuthCheck) {
            // Suppress noise for expected auth checks
            return Promise.reject(error);
        }

        console.error(`[API ERROR] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
