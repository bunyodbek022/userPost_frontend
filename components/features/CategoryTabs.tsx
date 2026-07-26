import React from 'react';

interface CategoryTabsProps {
    categories: any[];
    currentCategory: string;
    onSelect: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, currentCategory, onSelect }) => {
    return (
        <div className="flex items-center gap-8 overflow-x-auto border-b border-gray-100 dark:border-[#2a2a2a] pb-0 mb-6 sticky top-16 bg-white dark:bg-[#0B1120] z-40 pt-2 scrollbar-hide transition-colors font-sans">
            <button
                onClick={() => onSelect('All')}
                className={`whitespace-nowrap pb-3 border-b-2 text-[15px] transition-all duration-300 relative group ${currentCategory === 'All'
                    ? 'border-brand-orange text-brand-orange dark:text-brand-orange dark:border-brand-orange font-bold'
                    : 'border-transparent text-gray-500 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-[#444] font-medium'
                    }`}
            >
                For you
                {currentCategory === 'All' && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand-orange rounded-full animate-in fade-in zoom-in-95 duration-300" />
                )}
            </button>
            {categories.map((cat) => (
                <button
                    key={cat._id || cat.name}
                    onClick={() => onSelect(cat.name)}
                    className={`whitespace-nowrap pb-3 border-b-2 text-[15px] transition-all duration-300 relative group ${currentCategory === cat.name
                        ? 'border-brand-orange text-brand-orange dark:text-brand-orange dark:border-brand-orange font-bold'
                        : 'border-transparent text-gray-500 dark:text-[#999999] hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-[#444] font-medium'
                        }`}
                >
                    {cat.name}
                    {currentCategory === cat.name && (
                        <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand-orange rounded-full animate-in fade-in zoom-in-95 duration-300" />
                    )}
                </button>
            ))}
        </div>
    );
};
