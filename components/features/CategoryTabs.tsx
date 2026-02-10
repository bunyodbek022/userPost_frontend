import React from 'react';

interface CategoryTabsProps {
    categories: any[];
    currentCategory: string;
    onSelect: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, currentCategory, onSelect }) => {
    return (
        <div className="flex items-center gap-6 overflow-x-auto border-b border-gray-100 pb-4 mb-8 sticky top-0 bg-white z-10 pt-4 scrollbar-hide">
            <button
                onClick={() => onSelect('All')}
                className={`whitespace-nowrap pb-1 border-b-2 text-sm transition-colors ${currentCategory === 'All'
                        ? 'border-black text-black font-medium'
                        : 'border-transparent text-gray-500 hover:text-black'
                    }`}
            >
                For you
            </button>
            {categories.map((cat) => (
                <button
                    key={cat._id || cat.name}
                    onClick={() => onSelect(cat.name)}
                    className={`whitespace-nowrap pb-1 border-b-2 text-sm transition-colors ${currentCategory === cat.name
                            ? 'border-black text-black font-medium'
                            : 'border-transparent text-gray-500 hover:text-black'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};
