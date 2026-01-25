"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`);
      setPost(res.data.data || res.data);
    };
    if (id) fetchPost();
  }, [id]);

  if (!post) return <div className="p-20 text-center font-black">Loading Story...</div>;

  return (
    <div className="max-w-3xl mx-auto py-20 px-6 font-serif">
      <h1 className="text-5xl font-bold mb-8">{post.title}</h1>
      <div className="flex items-center gap-3 mb-10 font-sans">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
          {post.author?.userName?.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{post.author?.userName}</p>
          <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-xl leading-relaxed text-gray-800 whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  );
}