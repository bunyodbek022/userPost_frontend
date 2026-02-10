"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Kategoriyalarni yuklash
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !content.trim() || selectedCategories.length === 0) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('categories', selectedCategories.join(','));
    if (image) formData.append('coverImage', image);

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success("Story published successfully!");
      router.push('/feed');
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout currentUser={currentUser}>
      <div className="max-w-4xl mx-auto py-10 px-6 xl:px-0">
        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Draft in {currentUser?.userName}</span>
          </div>
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!title || !content || selectedCategories.length === 0}
            className="rounded-full px-6 bg-green-600 hover:bg-green-700 text-white border-none text-sm transition-colors"
          >
            Publish
          </Button>
        </div>

        <form className="space-y-8">
          {/* Title Input */}
          <div className="relative group">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-4xl md:text-5xl font-serif font-bold placeholder:text-gray-300 border-none outline-none bg-transparent"
              autoFocus
            />
          </div>

          {/* Image Upload */}
          <div className="group">
            {!imagePreview ? (
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-black transition w-fit">
                <span className="text-2xl">+</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative group/img">
                <img src={imagePreview} alt="Cover" className="w-full max-h-[400px] object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-red-600 hover:bg-white transition opacity-0 group-hover/img:opacity-100"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tell your story..."
              rows={15}
              className="w-full text-xl font-serif leading-relaxed placeholder:text-gray-300 border-none outline-none bg-transparent resize-y"
            />
          </div>

          {/* Categories */}
          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Topics</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(cat._id)
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}