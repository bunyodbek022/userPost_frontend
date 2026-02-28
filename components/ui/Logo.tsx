import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    const bracketClasses = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-4xl'
    };

    return (
        <div className={`flex items-center font-black italic tracking-tighter ${className} ${sizeClasses[size]}`}>
            <span className="text-[#FF4F00]">Dev</span>
            <span className="dark:text-[#e0e0e0] text-black">Stories</span>
        </div>
    );
};
