import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#999999] mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-[#e0e0e0] focus:bg-white dark:focus:bg-[#252525] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-[#999999] transition-all outline-none disabled:bg-gray-100 dark:disabled:bg-[#191919] disabled:text-gray-400 dark:disabled:text-[#707070] placeholder:text-gray-400 dark:placeholder:text-[#707070] ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
