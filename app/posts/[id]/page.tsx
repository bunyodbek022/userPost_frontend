"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Avatar } from '../../../components/ui/Avatar';
import { Spinner } from '../../../components/ui/Spinner';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, userRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get('/users/profile').catch(() => ({ data: null }))
        ]);

        setPost(postRes.data.data || postRes.data);
        setCurrentUser(userRes.data?.data || userRes.data || null);
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
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
    loadComments();
  }, [loadComments]);

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
    if (!currentUser) {
      toast.error("Please log in to like");
      return;
    }
    try {
      const res = await api.post(`/posts/${id}/like`);
      const updated = res.data.data || res.data;
      setPost((prev: any) => ({ ...prev, likes: updated.likes }));
    } catch (err) {
      console.error("Like error:", err);
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
        <h1 className="text-2xl font-bold">Story not found.</h1>
      </div>
    </MainLayout>
  );

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isLiked = post.likes?.some((likeId: any) => (likeId._id || likeId) === currentUser?._id);

  return (
    <MainLayout currentUser={currentUser}>
      <article className="max-w-3xl mx-auto py-10 px-6 md:px-0">
        {/* Header / Meta */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight font-sans">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={post.author?.avatar}
                fallback={post.author?.userName || '?'}
                alt={post.author?.userName}
                size="md"
              />
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {post.author?.userName}
                </div>
                <div className="text-gray-500 text-xs flex gap-2">
                  <span>{date}</span>
                  <span>·</span>
                  <span>4 min read</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 text-gray-400">
              <button className="hover:text-black transition p-1" title="Share link" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Zm0-12.814a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-12 rounded-lg overflow-hidden bg-gray-50 aspect-video">
            <img src={post.coverImage.startsWith('http') ? post.coverImage : `${BACKEND_URL}${post.coverImage}`} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg md:prose-xl prose-slate max-w-none font-serif leading-relaxed text-gray-800">
          <div className="whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Footer / Tags */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-8">
            {post.categories?.map((cat: any) => (
              <span key={cat._id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {cat.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 py-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <span className="font-medium text-sm">{post.likes?.length || 0}</span>
            </button>

            <span className="flex items-center gap-2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              <span className="font-medium text-sm">{comments.length}</span>
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-bold font-sans mb-8">
            Responses ({comments.length})
          </h3>

          {/* Comment Input */}
          {currentUser ? (
            <div className="mb-10 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar
                  src={currentUser?.avatar}
                  fallback={currentUser?.userName || '?'}
                  alt={currentUser?.userName}
                  size="sm"
                  className="w-8 h-8 text-xs mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">{currentUser?.userName}</p>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows={3}
                    className="w-full text-sm text-gray-800 placeholder:text-gray-400 border-none outline-none bg-transparent resize-none font-serif leading-relaxed"
                  />
                  <div className="flex justify-end pt-2 border-t border-gray-100 mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || commentLoading}
                      className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {commentLoading ? 'Sending...' : 'Respond'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-10 bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">Please <a href="/login" className="text-green-600 font-medium underline">log in</a> to leave a comment.</p>
            </div>
          )}

          {/* Comment List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No responses yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {comments.map((comment: any) => (
                <div key={comment._id} className="py-6 border-b border-gray-100 last:border-none">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={comment.author?.avatar}
                      fallback={comment.author?.userName || '?'}
                      alt={comment.author?.userName}
                      size="sm"
                      className="w-8 h-8 text-xs mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{comment.author?.userName}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {(currentUser?._id === (comment.author?._id || comment.author) || currentUser?.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-400 hover:text-red-500 transition text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-serif leading-relaxed">
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
    </MainLayout>
  );
}