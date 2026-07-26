import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
                        type={inputType}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-[#e0e0e0] focus:bg-white dark:focus:bg-[#252525] focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-[#999999] transition-all outline-none disabled:bg-gray-100 dark:disabled:bg-[#191919] disabled:text-gray-400 dark:disabled:text-[#707070] placeholder:text-gray-400 dark:placeholder:text-[#707070] ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                            } ${isPassword ? 'pr-12' : ''} ${className}`}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
