import React from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/Avatar';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

interface PostCardProps {
    post: any;
    currentUser: any;
    onLike: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike }) => {
    const isLiked = post.likes?.some((id: any) => (id._id || id) === currentUser?._id);

    // Format date
    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const coverImageUrl = post.coverImage
        ? (post.coverImage.startsWith('http') ? post.coverImage : `${BACKEND_URL}${post.coverImage}`)
        : null;

    return (
        <article className="border-b border-gray-100 py-8 group last:border-none">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 order-2 md:order-1 w-full">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <Avatar
                            src={post.author?.avatar}
                            fallback={post.author?.userName || '?'}
                            alt={post.author?.userName}
                            size="sm"
                            className="w-6 h-6 text-xs"
                        />
                        <span className="font-medium text-sm text-gray-900">{post.author?.userName}</span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-500 text-sm">{date}</span>
                    </div>

                    {/* Title & Excerpt */}
                    <Link href={`/posts/${post._id}`} className="group-hover:opacity-80 transition-opacity">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-sans tracking-tight leading-tight">
                            {post.title}
                        </h2>
                        <p className="text-gray-500 font-serif text-base leading-relaxed line-clamp-3 mb-4 hidden md:block">
                            {post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : '')}
                        </p>
                    </Link>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600 font-medium">
                                {post.categories?.[0]?.name || 'Story'}
                            </span>
                            <span className="text-xs text-gray-400">4 min read</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onLike(post._id)}
                                className={`flex items-center gap-1.5 transition group/like hover:text-red-500 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={isLiked ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`w-6 h-6 transition-transform active:scale-75 ${isLiked ? '' : 'group-hover/like:scale-110'}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Image */}
                {coverImageUrl && (
                    <Link href={`/posts/${post._id}`} className="order-1 md:order-2 w-full md:w-40 aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                        <img src={coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </Link>
                )}
            </div>
        </article>
    );
};
