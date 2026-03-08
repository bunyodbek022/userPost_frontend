"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/features/PostCard';
import { useUserProfile } from '../../hooks/usePosts';
import { toast } from 'react-hot-toast';

const API_BASE = '/api';
axios.defaults.withCredentials = true;

export default function BookmarksPage() {
    const { data: user } = useUserProfile();
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        // Implement logout or use a shared hook if available
        axios.post(`${API_BASE}/users/logout`).then(() => {
            window.location.href = '/login';
        });
    };

    const fetchBookmarks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/users/bookmarks/all`);
            if (res.data.success) {
                // Mark posts as bookmarked for the PostCard component
                const markedPosts = (res.data.data || []).map((post: any) => ({
                    ...post,
                    isBookmarked: true
                }));
                setBookmarks(markedPosts);
            }
        } catch (err) {
            console.error("Bookmarks fetch error:", err);
            toast.error("Failed to load reading list");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchBookmarks();
    }, [user, fetchBookmarks]);

    const handleLike = async (postId: string) => {
        try {
            await axios.post(`${API_BASE}/posts/${postId}/like`);
        } catch (err) {
            toast.error("Like action failed");
        }
    };

    const handleBookmark = async (postId: string) => {
        try {
            const res = await axios.post(`${API_BASE}/users/bookmarks/${postId}`);
            if (res.data.success) {
                if (!res.data.isBookmarked) {
                    // If removed, filter out from local state
                    setBookmarks(prev => prev.filter(p => p._id !== postId));
                    toast.success("Removed from reading list");
                } else {
                    toast.success("Saved to reading list");
                }
            }
        } catch (err) {
            toast.error("Bookmark action failed");
        }
    };

    const handleRepost = async (postId: string) => {
        try {
            await axios.post(`${API_BASE}/posts/${postId}/repost`);
        } catch (err) {
            toast.error("Repost action failed");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--warm-paper)] dark:bg-[#0f0e0d] flex font-sans text-[var(--ink)] dark:text-white transition-colors duration-300">
            <Sidebar currentUser={user} onLogout={logout} className="w-[80px] xl:w-[280px] hidden md:flex sticky top-0 h-screen" />

            <main className="flex-1 max-w-2xl mx-auto px-4 py-12 lg:py-20">
                <div className="mb-12 animate-fade-up">
                    <h1 className="text-4xl font-serif font-black mb-3 tracking-tight">Reading List</h1>
                    <p className="text-[var(--ink-soft)] dark:text-[#999999] font-medium">Stories you've saved for later</p>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-[2px] bg-brand-orange animate-pulse" />
                    </div>
                ) : bookmarks.length > 0 ? (
                    <div className="space-y-10 animate-fade-up [animation-delay:100ms]">
                        {bookmarks.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={user}
                                onLike={handleLike}
                                onBookmark={handleBookmark}
                                onRepost={handleRepost}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center animate-fade-up [animation-delay:200ms]">
                        <div className="text-6xl mb-8 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">📚</div>
                        <h2 className="text-2xl font-black mb-3 tracking-tight">Your reading list is empty</h2>
                        <p className="text-[var(--ink-soft)] dark:text-[#999999] mb-12 max-w-sm mx-auto leading-relaxed">Click the bookmark icon on any story to save it for later and build your personal library.</p>
                        <a href="/feed" className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-brand-orange text-white font-black tracking-widest text-[10px] uppercase hover:scale-105 transition-all shadow-xl shadow-brand-orange/20">
                            Explore stories
                        </a>
                    </div>
                )}
            </main>
        </div>
    );
}
