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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600 ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
