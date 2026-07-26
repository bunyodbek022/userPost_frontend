import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'substack' | 'orange' | 'green' | 'black';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#191919]";

    const variants = {
        primary: "bg-[#3B82F6] text-white hover:bg-[#2563EB] border border-transparent shadow-sm dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#2563EB]",
        secondary: "bg-white text-gray-800 border border-gray-300 hover:border-gray-500 hover:bg-gray-50 dark:bg-[#1E293B] dark:text-[#e0e0e0] dark:border-[#333333] dark:hover:border-[#999999]",
        ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-[#999999] dark:hover:text-white dark:hover:bg-[#1E293B]",
        danger: "bg-white text-red-600 border border-red-200 hover:border-red-600 hover:bg-red-50 dark:bg-[#1E293B] dark:text-red-400 dark:border-red-900 dark:hover:border-red-400 dark:hover:bg-red-950",
        substack: "bg-[#EF4400] text-white hover:bg-[#D93D00] border border-transparent shadow-sm",
        orange: "bg-[#EF4400] text-white hover:bg-[#D93D00] border border-transparent shadow-sm",
        green: "bg-[#1E7D4E] text-white hover:bg-[#16643F] border border-transparent shadow-sm",
        black: "bg-[#0F1111] text-white hover:bg-[#000000] border border-transparent shadow-sm",
    };

    const sizes = {
        sm: "px-4 py-1.5 text-sm",
        md: "px-5 py-2 text-[15px]",
        lg: "px-8 py-3 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="mr-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            ) : null}
            {children}
        </button>
    );
};
