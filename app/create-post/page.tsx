"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

interface Category {
  _id: string;
  name: string;
}

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, userRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users/profile').catch(() => ({ data: null }))
        ]);
        setCategories(catRes.data.data || catRes.data || []);
        setCurrentUser(userRes.data?.data || userRes.data || null);
      } catch (err) {
        console.error('Initialization error:', err);
        toast.error("Failed to load data");
      }
    };
    fetchInitData();
  }, []);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    // Strip HTML tags to check if content is truly empty
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!textContent) { toast.error("Content is required"); return; }
    if (selectedCategories.length === 0) { toast.error("Please select at least one topic"); return; }
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content);
    formData.append('status', 'PUBLISHED');
    // Send categories as comma-separated string (ParseArrayPipe expects this)
    formData.append('categories', selectedCategories.join(','));
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success("Story published successfully!");
      router.push('/feed');
    } catch (err: any) {
      console.error('Post error:', err.response?.data);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout currentUser={currentUser}>
      <div className="max-w-3xl mx-auto py-10 px-6 xl:px-0">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-[#333] pb-4">
          <span className="text-gray-400 dark:text-[#707070] text-sm">
            Draft · {currentUser?.userName}
          </span>
          <Button
            onClick={() => handleSubmit()}
            isLoading={loading}
            disabled={!title || !content || content === '<p></p>' || selectedCategories.length === 0}
            className="rounded-full px-6 bg-brand-orange hover:opacity-90 text-white border-none text-sm transition-colors"
          >
            Publish
          </Button>
        </div>

        {/* ── Title ── */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl md:text-5xl font-serif font-bold placeholder:text-gray-300 dark:placeholder:text-[#707070] border-none outline-none bg-transparent text-gray-900 dark:text-[#e0e0e0]"
            autoFocus
          />
        </div>

        {/* ── Cover Image ── */}
        <div className="mb-8">
          {!coverPreview ? (
            <label className="flex items-center gap-2 cursor-pointer text-gray-400 dark:text-[#707070] hover:text-gray-700 dark:hover:text-gray-300 transition w-fit group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm font-medium">Add cover image</span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          ) : (
            <div className="relative group/img">
              <img src={coverPreview} alt="Cover" className="w-full max-h-[400px] object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 p-2 rounded-full text-red-500 hover:bg-white dark:hover:bg-black transition opacity-0 group-hover/img:opacity-100 shadow"
              >✕</button>
            </div>
          )}
        </div>

        {/* ── Rich Text Editor ── */}
        <div className="mb-10">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Tell your story... (select text to format it)"
          />
        </div>

        {/* ── Topics ── */}
        <div className="pt-8 border-t border-gray-100 dark:border-[#333]">
          <p className="text-sm font-medium text-gray-500 dark:text-[#999] mb-4 uppercase tracking-wide">Topics</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat._id}
                type="button"
                onClick={() => toggleCategory(cat._id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(cat._id)
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-500 dark:text-[#999] hover:bg-gray-200 dark:hover:bg-[#333]'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}