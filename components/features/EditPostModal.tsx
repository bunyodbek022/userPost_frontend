"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { RichTextEditor } from '../ui/RichTextEditor';

interface EditPostModalProps {
    post: any;
    onClose: () => void;
    onSave: (data: { title: string; content: string }) => void;
    isLoading?: boolean;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave, isLoading }) => {
    const [title, setTitle] = useState(post.title || '');
    const [content, setContent] = useState(post.content || '');

    const handleSave = () => {
        // Strip HTML tags to check if content is truly empty
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!textContent) {
            toast.error("Content is required");
            return;
        }

        onSave({ title: title.trim(), content });
    };

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 sm:p-10">
            <div className="max-w-3xl w-full bg-white dark:bg-[#1f1f1f] shadow-2xl dark:shadow-black/50 rounded-2xl p-6 sm:p-10 border border-gray-100 dark:border-[#333333] max-h-[95vh] overflow-y-auto relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 dark:text-[#707070] hover:text-gray-600 dark:hover:text-[#999999] transition-colors p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-10 flex items-center justify-between border-b border-gray-100 dark:border-[#333] pb-6 pr-12">
                    <h2 className="text-2xl font-bold dark:text-white font-sans">Edit Story</h2>
                    <Button
                        onClick={handleSave}
                        isLoading={isLoading}
                        disabled={!title.trim() || !content || content === '<p></p>'}
                        className="rounded-full px-8 bg-brand-orange hover:opacity-90 text-white border-none text-sm transition-colors"
                    >
                        Save
                    </Button>
                </div>

                <div className="space-y-8">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full text-3xl sm:text-4xl font-serif font-bold placeholder:text-gray-300 dark:placeholder:text-[#707070] border-none outline-none bg-transparent text-gray-900 dark:text-[#e0e0e0]"
                            autoFocus
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="min-h-[300px]">
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Tell your story..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
