"use client";
import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a') || target.closest('button') || target.closest('.clickable')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    useEffect(() => {
        let frameId: number;
        const animateRing = () => {
            setRingPosition(prev => ({
                x: prev.x + (position.x - prev.x) * 0.15,
                y: prev.y + (position.y - prev.y) * 0.15
            }));
            frameId = requestAnimationFrame(animateRing);
        };
        frameId = requestAnimationFrame(animateRing);
        return () => cancelAnimationFrame(frameId);
    }, [position]);

    return (
        <>
            <div
                className="cursor flex items-center justify-center"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: isHovering ? '18px' : '12px',
                    height: isHovering ? '18px' : '12px',
                }}
            >
                {/* Dot inside custom cursor as seen in screenshots */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
            <div
                className="cursor-ring"
                style={{
                    left: `${ringPosition.x}px`,
                    top: `${ringPosition.y}px`,
                    width: isHovering ? '52px' : '38px',
                    height: isHovering ? '52px' : '38px',
                    borderColor: isHovering ? 'var(--orange)' : 'rgba(22, 18, 14, 0.4)'
                }}
            />
        </>
    );
};
