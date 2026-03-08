"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { Spinner } from '../../../components/ui/Spinner';
import { EditPostModal } from '../../../components/features/EditPostModal';
import { Button } from '../../../components/ui/Button';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Edit State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Optimistic local states (mirror PostCard pattern)
  const [localLikes, setLocalLikes] = useState<any[]>([]);
  const [localReposts, setLocalReposts] = useState<any[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const loadPost = useCallback(async () => {
    try {
      const [postRes, userRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get('/users/profile').catch(() => ({ data: null }))
      ]);

      setPost(postRes.data.data || postRes.data);
      setCurrentUser(userRes.data?.data || userRes.data || null);
      const postData = postRes.data.data || postRes.data;
      setPost(postData);
      setLocalLikes(postData?.likes || []);
      setLocalReposts(postData?.reposts || []);
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const res = await api.get(`/comments/post/${id}`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id, loadPost, loadComments]);

  useEffect(() => {
    if (currentUser?.bookmarks && post) {
      setIsBookmarked(currentUser.bookmarks.some((b: any) => (b._id || b) === post._id));
    }
  }, [currentUser, post]);

  // Sync if post changes from outside
  useEffect(() => { if (post?.likes) setLocalLikes(post.likes); }, [post?.likes]);
  useEffect(() => { if (post?.reposts) setLocalReposts(post.reposts); }, [post?.reposts]);

  // Close share dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    if (shareOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }

    setCommentLoading(true);
    try {
      await api.post('/comments', {
        content: commentText.trim(),
        post: id,
      });
      setCommentText('');
      toast.success("Comment added!");
      loadComments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success("Comment deleted");
      loadComments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleLike = async () => {
    if (!currentUser) { toast.error("Please log in to like"); return; }
    // Optimistic update first
    const alreadyLiked = localLikes.some((id: any) => (id._id || id) === currentUser._id);
    if (alreadyLiked) {
      setLocalLikes(localLikes.filter((id: any) => (id._id || id) !== currentUser._id));
    } else {
      setLocalLikes([...localLikes, currentUser._id]);
    }
    try {
      const res = await api.post(`/posts/${id}/like`);
      const updatedData = res.data.data || res.data;
      if (updatedData?.likes) setLocalLikes(updatedData.likes);
    } catch (err: any) {
      // Rollback
      setLocalLikes(post?.likes || []);
      toast.error(err.response?.data?.message || "Like failed. Try again.");
    }
  };

  const handleRepost = async () => {
    if (!currentUser) { toast.error("Please log in to repost"); return; }
    // Optimistic update first
    const alreadyReposted = localReposts.some((id: any) => (id._id || id) === currentUser._id);
    if (alreadyReposted) {
      setLocalReposts(localReposts.filter((id: any) => (id._id || id) !== currentUser._id));
    } else {
      setLocalReposts([...localReposts, currentUser._id]);
    }
    try {
      const res = await api.post(`/posts/${id}/repost`);
      const updatedData = res.data.data || res.data;
      if (updatedData?.reposts) setLocalReposts(updatedData.reposts);
      else toast.success("Reposted!");
    } catch (err: any) {
      setLocalReposts(post?.reposts || []);
      toast.error(err.response?.data?.message || "Repost failed");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      toast.error("Please log in to bookmark");
      return;
    }
    try {
      await api.post(`/users/bookmarks/${id}`);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bookmark failed");
    }
  };

  const handleEdit = () => {
    setEditingPost(post);
  };

  const handleSaveEdit = async (data: { title: string; content: string }) => {
    try {
      setIsSavingPost(true);
      const res = await api.patch(`/posts/${id}`, data);
      setPost(res.data.data || res.data);
      toast.success("Story updated successfully");
      setEditingPost(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update story");
    } finally {
      setIsSavingPost(false);
    }
  };

  if (loading) return (
    <MainLayout currentUser={null}>
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    </MainLayout>
  );

  if (!post) return (
    <MainLayout currentUser={currentUser}>
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold dark:text-[#e0e0e0]">Story not found.</h1>
      </div>
    </MainLayout>
  );

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isLiked = localLikes?.some((likeId: any) => (likeId._id || likeId) === currentUser?._id);
  const isReposted = localReposts?.some((repostId: any) => (repostId._id || repostId) === currentUser?._id);
  const isOwnPost = currentUser?._id === (post.author?._id || post.author);

  return (
    <MainLayout currentUser={currentUser}>
      <article className="max-w-3xl mx-auto py-10">
        {/* 1. Title */}
        <h1 className="text-[32px] md:text-[42px] font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight font-sans">
          {post.title}
        </h1>

        {/* 2. Author block (Header) */}
        <div className="flex items-center gap-3 mb-8">
          <Avatar
            src={post.author?.avatar}
            fallback={post.author?.userName || '?'}
            alt={post.author?.userName}
            size="md"
            className="w-12 h-12"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#292929] dark:text-white text-[15px]">
                {post.author?.userName}
              </span>
              {!isOwnPost && (
                <button className="text-brand-orange text-xs font-bold hover:underline ml-1">
                  Subscribe
                </button>
              )}
            </div>
            <div className="text-gray-500 dark:text-[#999999] text-[13px] flex gap-2">
              <span>4 min read</span>
              <span>·</span>
              <span>{date}</span>
            </div>
          </div>
        </div>

        {/* 3. Actions Bar */}
        <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-[#2a2a2a] mb-10">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors duration-300 ${isLiked ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Like"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-sans">{localLikes.length > 0 ? localLikes.length : ''}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Comment"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-sans">{comments.length > 0 ? comments.length : ''}</span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 transition-colors duration-300 ${isReposted ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Repost"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
              <span className="text-[13px] font-sans">{localReposts.length > 0 ? localReposts.length : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`transition-colors ${isBookmarked ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Save to Reading List"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Share */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Share"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              {shareOpen && (
                <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-[#333] rounded-xl shadow-2xl p-2 min-w-[180px] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {[{ p: 'x', label: 'Share on X', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> }, { p: 'telegram', label: 'Telegram', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> }, { p: 'whatsapp', label: 'WhatsApp', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> }].map(s => (
                    <button key={s.p} onClick={() => { const url = window.location.href; const text = `Check out this story: ${post.title}`; let su = ''; if (s.p === 'x') su = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; if (s.p === 'telegram') su = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; if (s.p === 'whatsapp') su = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`; if (su) window.open(su, '_blank'); setShareOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors font-sans">
                      {s.icon}{s.label}
                    </button>
                  ))}
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); setShareOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border-t border-gray-100 dark:border-[#333] mt-1 pt-2 font-sans">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                    Copy link
                  </button>
                </div>
              )}
            </div>

            {isOwnPost && (
              <button
                onClick={handleEdit}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Edit Story"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 4. Cover Image */}
        {post.coverImage && (
          <div className="mb-10 rounded-sm overflow-hidden bg-gray-50 dark:bg-[#1f1f1f]">
            <img
              src={post.coverImage.startsWith('http') ? post.coverImage : `${BACKEND_URL}${post.coverImage}`}
              alt={post.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* 5. Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-[1.6] text-[#292929] dark:text-[#d1d1d1] mb-20 text-[20px]">
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* 6. Comments Section */}
        <div id="comments" className="mt-12 pt-12 border-t border-gray-100 dark:border-[#2a2a2a]">
          <h3 className="text-[22px] font-bold font-sans mb-8 dark:text-white">
            Responses ({comments.length})
          </h3>

          {currentUser ? (
            <div className="mb-10 bg-white dark:bg-[#121212] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar
                  src={currentUser?.avatar}
                  fallback={currentUser?.userName || '?'}
                  alt={currentUser?.userName}
                  size="sm"
                  className="w-10 h-10 mt-1"
                />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows={4}
                    className="w-full text-[16px] text-[#292929] dark:text-gray-200 placeholder:text-gray-400 border-none outline-none bg-transparent resize-none font-sans"
                  />
                  <div className="flex justify-end pt-3 border-t border-gray-50 dark:border-[#2a2a2a] mt-3">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || commentLoading}
                      className="px-6 py-2 bg-[#1a1a1a] dark:bg-white dark:text-black text-white text-[14px] font-bold rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {commentLoading ? 'Sending...' : 'Respond'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-10 bg-gray-50 dark:bg-[#121212] rounded-xl p-8 text-center border border-dashed border-gray-200 dark:border-[#2a2a2a]">
              <p className="text-gray-500 dark:text-[#999999] text-[15px]">Please <a href="/login" className="text-brand-orange font-bold hover:underline">log in</a> to leave a comment.</p>
            </div>
          )}

          {commentsLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((comment: any) => (
                <div key={comment._id} className="pb-8 border-b border-gray-50 dark:border-[#2a2a2a] last:border-none">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={comment.author?.avatar}
                      fallback={comment.author?.userName || '?'}
                      alt={comment.author?.userName}
                      size="sm"
                      className="w-9 h-9"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px] text-[#292929] dark:text-white">
                            {comment.author?.userName}
                          </span>
                          <span className="text-[12px] text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[15px] text-[#292929] dark:text-[#bcbcbc] leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
          isLoading={isSavingPost}
        />
      )}
    </MainLayout>
  );
}