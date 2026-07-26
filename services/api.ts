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
                // If refresh fails, redirect to login
                if (typeof window !== 'undefined' && !isAuthCheck) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401) {
            if (isAuthCheck) {
                // Suppress noise for expected auth checks on public pages
                return Promise.reject(error);
            }
            // If it's a 401 and we didn't intercept it for refresh (or refresh already tried)
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        console.error(`[API ERROR] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
