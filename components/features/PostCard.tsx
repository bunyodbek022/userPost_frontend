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
    onEdit?: (post: any) => void;
    onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onRepost, onEdit, onDelete }) => {
    // Optimistic states
    const [localLikes, setLocalLikes] = useState(post.likes || []);
    const [localReposts, setLocalReposts] = useState(post.reposts || []);
    const isLiked = localLikes?.some((id: any) => (id._id || id) === currentUser?._id);
    const isReposted = localReposts?.some((id: any) => (id._id || id) === currentUser?._id);

    const [animating, setAnimating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const shareRef = useRef<HTMLDivElement>(null);

    // Sync local state with prop updates (to handle mutation success from parent)
    useEffect(() => {
        setLocalLikes(post.likes || []);
    }, [post.likes]);

    useEffect(() => {
        setLocalReposts(post.reposts || []);
    }, [post.reposts]);

    const authorId = post.author?._id || post.author;
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

    return (
        <article className="border-b border-gray-100 dark:border-[#2a2a2a] py-5 group last:border-none">
            {/* Row 1: Author info */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <Avatar
                        src={post.author?.avatar}
                        fallback={post.author?.userName || '?'}
                        alt={post.author?.userName}
                        size="sm"
                        className="w-9 h-9 text-sm"
                    />
                    <div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-[#e0e0e0]">
                            {post.author?.userName}
                        </span>
                        <span className="text-gray-400 dark:text-[#666] text-xs ml-2">{date}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isOwner && (
                        <FollowButton
                            targetUserId={String(authorId)}
                            currentUser={currentUser}
                            size="sm"
                        />
                    )}

                    {/* More Menu */}
                    {canManage && (onEdit || onDelete) && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => { setMenuOpen(!menuOpen); setConfirmDelete(false); }}
                                className="text-gray-400 dark:text-[#707070] hover:text-gray-600 dark:hover:text-[#999999] transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#252525]"
                                title="More options"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                                    <circle cx="5" cy="12" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="19" cy="12" r="1.5" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-8 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333333] rounded-xl shadow-lg dark:shadow-black/30 py-1.5 min-w-[160px] z-50">
                                    {!confirmDelete ? (
                                        <>
                                            {onEdit && (
                                                <button
                                                    onClick={() => { onEdit(post); setMenuOpen(false); }}
                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-[#999999] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
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
                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
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
                                            <p className="text-sm text-gray-700 dark:text-[#999999] mb-3 font-medium">Delete this story?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { onDelete!(post._id); setMenuOpen(false); setConfirmDelete(false); }}
                                                    className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-full hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(false)}
                                                    className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-[#999999] text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
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

            {/* Row 2: Title (always visible above image) */}
            <Link href={`/posts/${post._id}`} className="block group-hover:opacity-90 transition-opacity mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#e0e0e0] leading-tight group-hover:underline">
                    {post.title}
                </h2>
            </Link>

            {/* Row 3: Cover image (full width, only if exists) */}
            {coverImageUrl && (
                <Link href={`/posts/${post._id}`} className="block mb-3 rounded-xl overflow-hidden border border-gray-100 dark:border-[#2a2a2a]">
                    <img
                        src={coverImageUrl}
                        alt={post.title}
                        className="w-full object-cover max-h-[320px]"
                    />
                </Link>
            )}

            {/* Row 4: Excerpt/Content (below image if image exists, or directly below title) */}
            {post.content && (
                <Link href={`/posts/${post._id}`} className="block mb-3 group-hover:opacity-90 transition-opacity">
                    <p className="text-gray-500 dark:text-[#888888] text-sm leading-relaxed line-clamp-3">
                        {post.content?.substring(0, 200) + (post.content?.length > 200 ? '...' : '')}
                    </p>
                </Link>
            )}

            {/* Row 5: Action bar */}
            <div className="flex items-center gap-6 mt-1">
                {/* Like */}
                <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-[#ff6719]' : 'text-gray-400 dark:text-[#707070] hover:text-black dark:hover:text-white'}`}
                    title={isLiked ? "Unlike" : "Like"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={isLiked ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        strokeWidth={isLiked ? 0 : 1.5}
                        stroke="currentColor"
                        className="w-5 h-5 transition-transform duration-300 ease-out"
                        style={{ transform: animating ? 'scale(1.2)' : 'scale(1)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    <span className="text-sm font-medium">{localLikes?.length || 0}</span>
                </button>

                {/* Comment */}
                <Link
                    href={`/posts/${post._id}#comments`}
                    className="flex items-center gap-1.5 text-gray-400 dark:text-[#707070] hover:text-black dark:hover:text-white transition-colors"
                    title="Comment"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-sm font-medium">{post.commentCount || 0}</span>
                </Link>

                {/* Repost */}
                <button
                    onClick={handleRepostClick}
                    className={`flex items-center gap-1.5 transition-colors ${isReposted ? 'text-green-600' : 'text-gray-400 dark:text-[#707070] hover:text-black dark:hover:text-white'}`}
                    title="Repost"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 1l4 4-4 4" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <path d="M7 23l-4-4 4-4" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span className="text-sm font-medium">{localReposts?.length || 0}</span>
                </button>

                {/* Share */}
                <div className="relative" ref={shareRef}>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareOpen(!shareOpen); }}
                        className="flex items-center text-gray-400 dark:text-[#707070] hover:text-black dark:hover:text-white transition-colors"
                        title="Share"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                    </button>

                    {shareOpen && (
                        <div className="absolute left-0 bottom-full mb-3 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333333] rounded-xl shadow-xl dark:shadow-black/50 py-2 min-w-[180px] z-[60]">
                            <button onClick={copyToClipboard} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-[#e0e0e0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                </svg>
                                Copy link
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-1 mx-2"></div>
                            <button onClick={() => shareOnSocial('telegram')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-[#e0e0e0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#24A1DE]">
                                    <path d="M11.944 0C5.342 0 0 5.348 0 12c0 6.652 5.342 12 11.944 12 6.602 0 11.944-5.348 11.944-12 0-6.652-5.342-12-11.944-12zM17.561 8.24c-.168.804-1.244 5.412-1.792 7.502-.232.884-.556 1.18-.872 1.212-.68.064-1.196-.448-1.856-.884-1.036-.676-1.62-.1-2.204.288-.132.088-2.316 2.212-2.356 2.388-.004.024-.008.084-.04.108-.032.024-.076.012-.108 0-.04-.008-.684-.232-1.284-.424l-1.624-.512c-.352-.112-.632-.172-.608-.364.012-.1-.032-.196.252-.328 1.868-.816 5.068-2.124 5.86-2.436.54-.208 1.12-.312 1.512-.312.332 0 .54.012.724.036.328.052.88.352.996.684.116.332.116.616.084.884l-.364 1.708c-.068.324-.26.6-.548.74s-.632.116-.916-.076l-.68-.444c-.26-.172-.416-.46-.416-.768v-.004l3.196-1.504c.1-.048.2-.072.3-.072.2 0 .38.084.492.236.14.192.152.448.04.656l-2.028 3.736s-.104.184-.288.24-.388-.004-.564-.176l-.428-.416c-.232-.224-.352-.536-.34-.848.016-.312.16-.604.4-.8l2.964-2.42c.164-.132.256-.332.256-.54s-.096-.408-.26-.54c-.164-.132-.388-.204-.616-.204s-.452.072-.616.204l-3.328 2.716s-1.192.972-2.684 0L17.561 8.24z" />
                                </svg>
                                Telegram
                            </button>
                            <button onClick={() => shareOnSocial('whatsapp')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-[#e0e0e0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.53 1.036 3.534l-.067.227c-.231.785-.5 1.7-.751 2.553l-.155.526 2.656-.697.58-.152.062-.016a5.751 5.751 0 0 0 2.407.533c3.18 0 5.766-2.586 5.767-5.766 0-3.18-2.586-5.766-5.767-5.766zm3.361 8.13c-.145.408-.737.76-1.02.798-.186.025-.43.045-1.157-.251-1.341-.546-2.228-1.928-2.295-2.016-.067-.089-1.114-1.482-1.114-2.81 0-1.328.694-1.977.94-2.245l.178-.195a.443.443 0 0 1 .324-.153l.138.002.324.015c.108.005.216.01.293.018l.113.012c.1.011.168.02.241.171l.073.155c.205.437.494 1.054.538 1.144l.035.07c.07.142.115.234.022.421l-.042.083c-.042.083-.1.198-.2.315-.099.117-.209.245-.298.334-.1.101-.205.21-.089.408.116.198.514.848 1.101 1.373.757.676 1.391.886 1.587.984l.049.025c.198.1.313.082.43-.053l.035-.04c.168-.194.398-.534.542-.741l.056-.081c.089-.129.176-.11.298-.065l.08.031c.4.156 1.272.631 1.492.74l.065.032c.118.058.196.097.225.145l.019.034c.067.12.067.689-.224 1.504z" />
                                </svg>
                                WhatsApp
                            </button>
                            <button onClick={() => shareOnSocial('x')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-[#e0e0e0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-black dark:text-white">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                X (Twitter)
                            </button>
                        </div>
                    )}
                </div>

                {/* Category pill */}
                <span className="ml-auto text-xs bg-gray-100 dark:bg-[#252525] px-2.5 py-1 rounded-full text-gray-600 dark:text-[#999999] font-medium">
                    {post.categories?.[0]?.name || 'Story'}
                </span>
            </div>
        </article>
    );
};
