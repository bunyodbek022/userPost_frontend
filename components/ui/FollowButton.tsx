"use client";
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface FollowButtonProps {
    targetUserId: string;
    currentUser: any;
    /** Optional pre-fetched follow state to skip the initial API call */
    initialIsFollowing?: boolean;
    /** Called after a successful follow/unfollow so parent can refresh counts */
    onToggle?: (isFollowing: boolean) => void;
    size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
    targetUserId,
    currentUser,
    initialIsFollowing,
    onToggle,
    size = 'sm',
}) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing ?? false);
    const [loading, setLoading] = useState(false);

    // Fetch status once on mount if not supplied by parent
    useEffect(() => {
        if (!currentUser || initialIsFollowing !== undefined) return;
        let cancelled = false;
        api
            .get(`/users/${targetUserId}/follow-status`)
            .then((res) => {
                if (!cancelled) setIsFollowing(res.data?.data?.isFollowing ?? false);
            })
            .catch(() => {/* swallow — user may not be logged in */ });
        return () => { cancelled = true; };
    }, [targetUserId, currentUser, initialIsFollowing]);

    if (!currentUser) return null;
    if (String(currentUser._id) === String(targetUserId)) return null;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;
        setLoading(true);
        const newState = !isFollowing;
        setIsFollowing(newState); // optimistic
        try {
            if (newState) {
                await api.post(`/users/${targetUserId}/follow`);
            } else {
                await api.delete(`/users/${targetUserId}/follow`);
            }
            onToggle?.(newState);
        } catch {
            setIsFollowing(!newState); // revert on error
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = size === 'sm'
        ? 'text-xs px-3 py-1 gap-1'
        : 'text-sm px-4 py-1.5 gap-1.5';

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`
        inline-flex items-center font-bold transition-all duration-200 rounded-full
        ${sizeClasses}
        ${size === 'sm'
                    ? (isFollowing
                        ? 'text-gray-500 dark:text-[#999999] hover:text-gray-700 dark:hover:text-white'
                        : 'text-[#ff6719] hover:text-[#e55a16]')
                    : (isFollowing
                        ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]'
                        : 'bg-[#ff6719] text-white hover:bg-[#e55a16]')
                }
        ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            {isFollowing ? (
                <>
                    {/* Checkmark */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}>
                        <path fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    Subscribed
                </>
            ) : (
                'Subscribe'
            )}
        </button>
    );
};
