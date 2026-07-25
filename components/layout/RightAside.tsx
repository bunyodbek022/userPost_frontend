"use client";
import React from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/Avatar';
import { useTopPosts, useCategories, useTopUsers, useUserProfile } from '../../hooks/usePosts';
import { Spinner } from '../ui/Spinner';
import { FollowButton } from '../ui/FollowButton';

export const RightAside: React.FC = () => {
    const { data: topPosts = [], isLoading: postsLoading } = useTopPosts();
    const { data: categories = [], isLoading: catsLoading } = useCategories();
    const { data: topUsers = [] } = useTopUsers(3);
    const { data: currentUser } = useUserProfile();

    if (postsLoading || catsLoading) {
        return (
            <aside className="hidden xl:block w-[350px] sticky top-20 self-start p-6">
                <div className="flex justify-center py-20">
                    <Spinner size="sm" />
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden xl:block w-[350px] sticky top-20 self-start p-6 space-y-10">
            {/* Staff Picks (Popular Posts) */}
            <section>
                <h3 className="font-bold text-[#292929] dark:text-white mb-4">Staff Picks</h3>
                <div className="space-y-5">
                    {topPosts.slice(0, 3).map((post: any) => (
                        <Link key={post._id} href={`/posts/${post._id}`} className="block group">
                            <div className="flex items-center gap-2 mb-1">
                                <Avatar
                                    size="sm"
                                    alt={post.author?.userName || 'Author'}
                                    src={post.author?.avatar}
                                    fallback={post.author?.userName?.[0] || 'U'}
                                />
                                <span className="text-xs font-medium text-[#292929] dark:text-[#e0e0e0]">{post.author?.userName}</span>
                            </div>
                            <h4 className="font-bold text-[15px] leading-tight text-[#292929] dark:text-white line-clamp-2">
                                {post.title}
                            </h4>
                        </Link>
                    ))}
                </div>
                <Link href="/feed?category=Trending" className="inline-block mt-4 text-sm text-brand-orange hover:text-brand-orange/80 font-medium font-sans">
                    See full list
                </Link>
            </section>

            {/* Topics to follow */}
            {categories.length > 0 && (
                <section>
                    <h3 className="font-bold text-[#292929] dark:text-white mb-4">Recommended topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 8).map((topic: any) => (
                            <Link
                                key={topic._id}
                                href={`/feed?category=${topic.name}`}
                                className="px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-xs text-[#292929] dark:text-[#e0e0e0] rounded-full transition-colors font-sans"
                            >
                                {topic.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Who to subscribe */}
            {topUsers.length > 0 && (
                <section>
                    <h3 className="font-bold text-[#292929] dark:text-white mb-4">Who to subscribe</h3>
                    <div className="space-y-4">
                        {topUsers.map((author: any) => (
                            <div key={author._id} className="flex items-center justify-between gap-3">
                                <Link href={`/profile/${author._id}`} className="flex items-center gap-3 overflow-hidden min-w-0">
                                    <Avatar
                                        size="sm"
                                        alt={author.userName}
                                        src={author.avatar}
                                        fallback={author.userName?.[0] || 'U'}
                                        className="shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#292929] dark:text-white truncate">{author.userName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                            {author.followers?.length ?? 0} subscribers
                                        </p>
                                    </div>
                                </Link>
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
                                        className="shrink-0 px-4 py-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-full transition-colors font-sans"
                                    >
                                        Subscribe
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/subscribers"
                        className="inline-block mt-4 text-sm text-brand-orange hover:text-brand-orange/80 font-medium font-sans"
                    >
                        More
                    </Link>
                </section>
            )}

            {/* Footer Links */}
            <footer className="pt-10 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-400 dark:text-[#555] font-sans border-t border-gray-100 dark:border-[#2a2a2a]">
                <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help</Link>
                <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Status</Link>
                <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>
                <p className="w-full mt-2">© {new Date().getFullYear()} DevStories Platform</p>
            </footer>
        </aside>
    );
};
