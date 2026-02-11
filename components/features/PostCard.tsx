import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/Avatar';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

interface PostCardProps {
    post: any;
    currentUser: any;
    onLike: (postId: string) => void;
    onEdit?: (post: any) => void;
    onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onEdit, onDelete }) => {
    const isLiked = post.likes?.some((id: any) => (id._id || id) === currentUser?._id);
    const [animating, setAnimating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const authorId = post.author?._id || post.author;
    const isOwner = currentUser?._id && (String(authorId) === String(currentUser._id));
    const isAdmin = currentUser?.role === 'admin';
    const canManage = isOwner || isAdmin;

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
                setConfirmDelete(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // Format date
    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const coverImageUrl = post.coverImage
        ? (post.coverImage.startsWith('http') ? post.coverImage : `${BACKEND_URL}${post.coverImage}`)
        : null;

    const handleLikeClick = () => {
        setAnimating(true);
        onLike(post._id);
        setTimeout(() => setAnimating(false), 400);
    };

    return (
        <article className="border-b border-gray-100 py-8 group last:border-none">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 order-2 md:order-1 w-full">
                    {/* Author Info + Actions */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2">
                            {/* Star / Bookmark Icon */}
                            <button className="text-amber-400 hover:text-amber-500 transition-colors" title="Bookmark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l1.216 2.93a1.2 1.2 0 0 0 .958.693l3.167.324c1.165.119 1.634 1.56.79 2.429l-2.396 2.469a1.2 1.2 0 0 0-.36 1.122l.69 3.124c.253 1.145-.986 2.03-2.007 1.435L12 15.931l-2.77 1.826c-1.02.595-2.26-.29-2.007-1.435l.69-3.124a1.2 1.2 0 0 0-.36-1.122L5.157 9.586c-.845-.87-.375-2.31.79-2.429l3.167-.324a1.2 1.2 0 0 0 .958-.693l1.216-2.93Z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {/* More Menu (Edit/Delete) */}
                            {canManage && (onEdit || onDelete) && (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => { setMenuOpen(!menuOpen); setConfirmDelete(false); }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                        title="More options"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                                            <circle cx="12" cy="5" r="1.5" />
                                            <circle cx="12" cy="12" r="1.5" />
                                            <circle cx="12" cy="19" r="1.5" />
                                        </svg>
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                            {!confirmDelete ? (
                                                <>
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => { onEdit(post); setMenuOpen(false); }}
                                                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                            </svg>
                                                            Edit story
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => setConfirmDelete(true)}
                                                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                            </svg>
                                                            Delete story
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="px-4 py-3">
                                                    <p className="text-sm text-gray-700 mb-3 font-medium">Delete this story?</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { onDelete!(post._id); setMenuOpen(false); setConfirmDelete(false); }}
                                                            className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full hover:bg-red-700 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(false)}
                                                            className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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

                    {/* Footer Actions — Medium-style layout */}
                    <div className="flex items-center justify-between mt-6">
                        {/* Left: Comment count */}
                        <div className="flex items-center gap-3">
                            <Link href={`/posts/${post._id}#comments`} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                                </svg>
                                <span className="text-sm font-medium">{post.commentCount || 0}</span>
                            </Link>

                            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600 font-medium">
                                {post.categories?.[0]?.name || 'Story'}
                            </span>
                        </div>

                        {/* Right: Instagram-style Heart */}
                        <button
                            onClick={handleLikeClick}
                            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill={isLiked ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                                strokeWidth={isLiked ? 0 : 1.8}
                                stroke="currentColor"
                                className="w-6 h-6 transition-transform duration-300 ease-out"
                                style={{
                                    transform: animating ? 'scale(1.3)' : 'scale(1)',
                                }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                        </button>
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
