import Image from 'next/image';

interface AvatarProps {
    src?: string;
    alt: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    fallback,
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-base",
        xl: "w-20 h-20 text-xl",
    };

    return (
        <div
            className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 border border-gray-200 ${sizeClasses[size]} ${className}`}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
            ) : (
                <span className="font-medium text-gray-600 uppercase tracking-wider">
                    {fallback.slice(0, 2)}
                </span>
            )}
        </div>
    );
};
