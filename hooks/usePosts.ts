import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// --- QUERIES ---

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data || res.data || [];
        },
    });
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await api.get('/users/profile');
            return res.data.data || res.data;
        },
        retry: false,
    });
};

export const usePosts = (categoryId: string | null | undefined, search: string) => {
    return useQuery({
        queryKey: ['posts', categoryId, search],
        queryFn: async () => {
            let url = '/posts?limit=20';
            if (categoryId && categoryId !== 'All') {
                url += `&category=${categoryId}`;
            }
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await api.get(url);
            return res.data.data || res.data || [];
        },
        placeholderData: (keepPreviousData) => keepPreviousData,
    });
};

export const useTopPosts = () => {
    return useQuery({
        queryKey: ['topPosts'],
        queryFn: async () => {
            const res = await api.get('/posts?sort=popular&limit=5');
            return res.data.data || res.data || [];
        },
        staleTime: 5 * 60 * 1000, // Keep top posts fresh for 5 mins
    });
};

export const useTopUsers = (limit = 20) => {
    return useQuery({
        queryKey: ['topUsers', limit],
        queryFn: async () => {
            const res = await api.get(`/users/top?limit=${limit}`);
            return res.data.data || res.data || [];
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

// --- MUTATIONS ---

export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => api.post(`/posts/${postId}/like`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['topPosts'] });
        },
    });
};

export const useRepostPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => api.post(`/posts/${postId}/repost`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['topPosts'] });
        },
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/posts/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['topPosts'] });
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => api.delete(`/posts/${postId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['topPosts'] });
        },
    });
};

export const useUserBookmarks = () => {
    return useQuery({
        queryKey: ['userBookmarks'],
        queryFn: async () => {
            const res = await api.get('/users/bookmarks/all');
            return res.data.data || res.data || [];
        },
        retry: false,
    });
};

export const useBookmarkPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => api.post(`/users/bookmarks/${postId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userBookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
};
