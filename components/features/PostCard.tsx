import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Avatar } from '../ui/Avatar';
import { FollowButton } from '../ui/FollowButton';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

interface PostCardProps {
    post: any;
    currentUser: any;
    onLike: (postId: string) => void;
    onRepost?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onEdit?: (post: any) => void;
    onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onRepost, onBookmark, onEdit, onDelete }) => {
    // Optimistic states
    const [localLikes, setLocalLikes] = useState(post.likes || []);
    const [localReposts, setLocalReposts] = useState(post.reposts || []);
    const isLiked = localLikes?.some((id: any) => (id._id || id) === currentUser?._id);
    const isReposted = localReposts?.some((id: any) => (id._id || id) === currentUser?._id);
    const [localIsBookmarked, setLocalIsBookmarked] = useState(post.isBookmarked || false);

    const [animating, setAnimating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const shareRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop updates (to handle mutation success from parent)
    useEffect(() => {
        setLocalLikes(post.likes || []);
    }, [post.likes]);

    useEffect(() => {
        setLocalReposts(post.reposts || []);
    }, [post.reposts]);

    useEffect(() => {
        setLocalIsBookmarked(post.isBookmarked || false);
    }, [post.isBookmarked]);

    const displayAuthor = post.repostedBy || post.author;
    const authorId = displayAuthor?._id || displayAuthor;
    const isOwner = currentUser?._id && (String(authorId) === String(currentUser._id));
    const isAdmin = currentUser?.role === 'admin';
    const canManage = isOwner || isAdmin;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
                setConfirmDelete(false);
            }
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
                setShareOpen(false);
            }
        };
        if (menuOpen || shareOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen, shareOpen]);

    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const coverImageUrl = post.coverImage
        ? (post.coverImage.startsWith('http') ? post.coverImage : `${BACKEND_URL}${post.coverImage}`)
        : null;

    // Reading time: avg 200 words/min
    const wordCount = (post.content || '').split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Trending if 5+ likes
    const isTrending = (localLikes?.length || 0) >= 5;

    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast.error("Please log in to like");
            return;
        }
        setAnimating(true);
        // Optimistic update
        const alreadyLiked = localLikes.some((id: any) => (id._id || id) === currentUser?._id);
        if (alreadyLiked) {
            setLocalLikes(localLikes.filter((id: any) => (id._id || id) !== currentUser?._id));
        } else {
            setLocalLikes([...localLikes, currentUser._id]);
        }
        onLike(post._id);
        setTimeout(() => setAnimating(false), 400);
    };

    const handleRepostClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast.error("Please log in to repost");
            return;
        }
        // Optimistic update
        const alreadyReposted = localReposts.some((id: any) => (id._id || id) === currentUser?._id);
        if (alreadyReposted) {
            setLocalReposts(localReposts.filter((id: any) => (id._id || id) !== currentUser?._id));
        } else {
            setLocalReposts([...localReposts, currentUser._id]);
        }
        onRepost?.(post._id);
    };

    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast.error("Please log in to bookmark");
            return;
        }
        setLocalIsBookmarked(!localIsBookmarked);
        onBookmark?.(post._id);
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/posts/${post._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
        setShareOpen(false);
    };

    const shareOnSocial = (platform: string) => {
        const url = `${window.location.origin}/posts/${post._id}`;
        const text = `Check out this story: ${post.title}`;
        let shareUrl = '';

        switch (platform) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'x':
                shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
        }

        if (shareUrl) window.open(shareUrl, '_blank');
        setShareOpen(false);
    };

    if (dismissed) return null;

    return (
        <article className="border-b border-gray-100 dark:border-[#2a2a2a] py-8 last:border-0 transition-opacity hover:opacity-95">
            {post.repostedBy && (
                <div className="flex items-center gap-2 mb-3 px-1 text-gray-500 dark:text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 2l4 4-4 4"></path>
                        <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                        <path d="M7 22l-4-4 4-4"></path>
                        <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    <span className="text-[12px] font-sans font-medium">
                        reposted from <Link href={`/posts/${post._id}`} className="font-bold hover:underline text-gray-900 dark:text-white">{post.author?.userName}</Link>
                    </span>
                </div>
            )}
            <div className="flex gap-8 items-start">
                <div className="flex-1 min-w-0">
                    {/* Author & Meta */}
                    {/* Author & Meta */}
                    <div className="flex items-center justify-between mb-3 relative">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${displayAuthor?._id || displayAuthor}`} className="shrink-0">
                                <Avatar
                                    src={displayAuthor?.avatar}
                                    fallback={displayAuthor?.userName || '?'}
                                    alt={displayAuthor?.userName}
                                    size="sm"
                                    className="w-5 h-5 text-[10px]"
                                />
                            </Link>
                            <div className="flex items-center gap-1 font-sans text-[12px] sm:text-[13px] text-[#292929] dark:text-[#d1d1d1]">
                                <Link href={`/profile/${displayAuthor?._id || displayAuthor}`} className="font-bold hover:underline">
                                    {displayAuthor?.userName}
                                </Link>
                                {displayAuthor?.role === 'admin' && (
                                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 ml-1">Staff</span>
                                )}
                                <span className="text-gray-400 dark:text-[#555] mx-0.5">·</span>
                                <span className="text-gray-500 dark:text-[#808080]">{date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {currentUser && (currentUser._id !== (displayAuthor?._id || displayAuthor)) && (
                                <FollowButton
                                    targetUserId={displayAuthor?._id || displayAuthor}
                                    currentUser={currentUser}
                                    initialIsFollowing={displayAuthor?.isFollowing}
                                    onToggle={() => { }}
                                />
                            )}
                            <div className="flex items-center gap-0.5">
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
                                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 transition-colors"
                                        title="More"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                                        </svg>
                                    </button>
                                    {menuOpen && (
                                        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-[#333] rounded-xl shadow-2xl overflow-hidden py-2 min-w-[200px] z-[100] animate-in fade-in zoom-in-95 duration-200" ref={menuRef}>
                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                Copy link
                                            </button>

                                            {!canManage && (
                                                <>
                                                    {currentUser?._id !== (post.author?._id || post.author) && (
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                                            Subscribe
                                                        </button>
                                                    )}
                                                    <div className="border-t border-gray-100 dark:border-[#333] my-1"></div>
                                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                                        Mute
                                                    </button>
                                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                                        Block
                                                    </button>
                                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                                        Report
                                                    </button>
                                                </>
                                            )}

                                            {canManage && (
                                                <>
                                                    <div className="border-t border-gray-100 dark:border-[#333] my-1"></div>
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(post); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        Edit story
                                                    </button>
                                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(post._id); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-medium">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
                                                        Delete story
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
                                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 transition-colors"
                                    title="Dismiss"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <Link href={`/posts/${post._id}`} className="block group">
                        <h2 className="post-title text-[20px] sm:text-[22px] mb-2 line-clamp-2">
                            {post.title}
                        </h2>
                    </Link>

                    {/* Excerpt */}
                    {post.content && (
                        <Link href={`/posts/${post._id}`} className="block mb-4">
                            <p className="font-serif text-[15px] sm:text-[16px] text-[#757575] dark:text-[#999999] line-clamp-2 leading-relaxed">
                                {(() => {
                                    const plain = (post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                                    return plain.length > 160 ? plain.substring(0, 160) + '...' : plain;
                                })()}

                            </p>
                        </Link>
                    )}

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[12px] text-gray-500 dark:text-[#707070] font-sans">
                            {readingTime} min read
                        </span>
                        {post.categories?.[0] && (
                            <span className="px-2.5 py-0.5 bg-red-50 dark:bg-brand-orange/10 text-brand-orange dark:text-brand-orange border border-red-100 dark:border-brand-orange/20 rounded-full text-[11px] font-sans font-medium">
                                {post.categories[0].name}
                            </span>
                        )}
                        {isTrending && (
                            <span className="text-brand-orange text-[12px]">★</span>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-3 mt-4">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={handleLikeClick}
                                className={`flex items-center gap-1.5 transition-colors duration-300 ${isLiked ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                title="Like"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <span className="text-[13px] font-sans">{(localLikes.length > 0) ? (localLikes.length >= 1000 ? (localLikes.length / 1000).toFixed(1) + 'K' : localLikes.length) : ''}</span>
                            </button>

                            <Link
                                href={`/posts/${post._id}#comments`}
                                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                title="Comment"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <span className="text-[13px] font-sans">{post.commentCount > 0 ? post.commentCount : ''}</span>
                            </Link>

                            <button
                                onClick={handleRepostClick}
                                className={`flex items-center gap-1.5 transition-colors duration-300 ${isReposted ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                title="Repost"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 2l4 4-4 4"></path>
                                    <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
                                    <path d="M7 22l-4-4 4-4"></path>
                                    <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                <span className="text-[13px] font-sans">{(localReposts.length > 0) ? (localReposts.length >= 1000 ? (localLikes.length / 1000).toFixed(1) + 'K' : localReposts.length) : ''}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBookmarkClick}
                                className={`transition-colors ${localIsBookmarked ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                title="Save to Reading List"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={localIsBookmarked ? "currentColor" : "none"}>
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareOpen(!shareOpen); }}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    title="Share"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                        <polyline points="16 6 12 2 8 6"></polyline>
                                        <line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                </button>

                                {shareOpen && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-[#333] rounded-xl shadow-2xl p-2 min-w-[180px] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200" ref={shareRef}>
                                        <button onClick={() => shareOnSocial('x')} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors font-sans">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                            Share on X
                                        </button>
                                        <button onClick={() => shareOnSocial('telegram')} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors font-sans">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                            Telegram
                                        </button>
                                        <button onClick={() => shareOnSocial('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors font-sans">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                            WhatsApp
                                        </button>
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border-t border-gray-100 dark:border-[#333] mt-1 pt-2 font-sans">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                            Copy link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {coverImageUrl && (
                    <Link href={`/posts/${post._id}`} className="shrink-0 w-20 h-20 sm:w-28 sm:h-24 md:w-36 md:h-28 rounded-sm overflow-hidden border border-gray-50 dark:border-white/5">
                        <img
                            src={coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                )}
            </div>
        </article>
    );
};
