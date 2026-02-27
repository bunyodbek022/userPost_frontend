import React from 'react';

interface CategoryTabsProps {
    categories: any[];
    currentCategory: string;
    onSelect: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, currentCategory, onSelect }) => {
    return (
        <div className="flex items-center gap-6 overflow-x-auto border-b border-gray-100 dark:border-[#333333] pb-4 mb-8 sticky top-0 bg-white dark:bg-[#191919] z-10 pt-4 scrollbar-hide transition-colors">
            <button
                onClick={() => onSelect('All')}
                className={`whitespace-nowrap pb-1 border-b-2 text-sm transition-colors ${currentCategory === 'All'
                    ? 'border-black dark:border-white text-black dark:text-white font-medium'
                    : 'border-transparent text-gray-500 dark:text-[#999999] hover:text-black dark:hover:text-white'
                    }`}
            >
                For you
            </button>
            {categories.map((cat) => (
                <button
                    key={cat._id || cat.name}
                    onClick={() => onSelect(cat.name)}
                    className={`whitespace-nowrap pb-1 border-b-2 text-sm transition-colors ${currentCategory === cat.name
                        ? 'border-black dark:border-white text-black dark:text-white font-medium'
                        : 'border-transparent text-gray-500 dark:text-[#999999] hover:text-black dark:hover:text-white'
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};
