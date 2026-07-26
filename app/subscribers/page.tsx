"use client";
import React from 'react';
import Link from 'next/link';
import { MainLayout } from '../../components/layout/MainLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useTopUsers, useUserProfile } from '../../hooks/usePosts';
import { Spinner } from '../../components/ui/Spinner';
import { FollowButton } from '../../components/ui/FollowButton';

export default function SubscribersPage() {
    const { data: users = [], isLoading } = useTopUsers(20);
    const { data: currentUser } = useUserProfile();

    return (
        <MainLayout currentUser={currentUser || null}>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="mb-10 animate-fade-up">
                    <h1 className="text-3xl font-bold font-sans dark:text-white mb-2">Who to subscribe</h1>
                    <p className="text-gray-500 dark:text-[#999] text-sm">
                        Top writers on DevStories, ranked by subscribers
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {users.map((author: any, idx: number) => (
                            <div
                                key={author._id}
                                className="flex items-center justify-between gap-4 p-4 bg-[#F9FAFB] dark:bg-[#1E293B] border border-gray-100 dark:border-[#2a2a2a] rounded-xl hover:border-gray-200 dark:hover:border-[#404040] transition-all"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Rank */}
                                    <span className="text-[13px] font-bold text-gray-400 dark:text-[#555] w-5 shrink-0 text-center">
                                        {idx + 1}
                                    </span>
                                    <Link href={`/profile/${author._id}`} className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            size="sm"
                                            alt={author.userName}
                                            src={author.avatar}
                                            fallback={author.userName?.[0] || 'U'}
                                            className="w-11 h-11 text-lg shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-bold text-[15px] dark:text-white truncate">{author.userName}</p>
                                            <p className="text-xs text-gray-500 dark:text-[#888]">
                                                {author.followers?.length ?? 0} subscribers
                                                {author.role === 'admin' && (
                                                    <span className="ml-2 text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">
                                                        Staff
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                </div>

                                {currentUser && String(currentUser._id) !== String(author._id) ? (
                                    <FollowButton
                                        targetUserId={String(author._id)}
                                        currentUser={currentUser}
                                        onToggle={() => { }}
                                        size="sm"
                                    />
                                ) : (
                                    <Link
                                        href={`/profile/${author._id}`}
                                        className="shrink-0 px-5 py-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-full transition-colors"
                                    >
                                        View
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
