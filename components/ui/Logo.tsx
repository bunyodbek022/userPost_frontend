import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl'
    };

    const bracketClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-5xl'
    };

    return (
        <div className={`flex items-center font-serif font-bold tracking-tight ${className} ${sizeClasses[size]}`}>
            <span className="text-brand-orange">Dev</span>
            <span className="text-[#292929] dark:text-white">Stories</span>
        </div>
    );
};
