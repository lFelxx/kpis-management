import React, { useEffect, useState } from 'react';

interface WarpSpeedProps {
    isActive: boolean;
    onComplete: () => void;
}

export const WarpSpeed: React.FC<WarpSpeedProps> = ({ isActive, onComplete }) => {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; speed: number }>>([]);

    useEffect(() => {
        if (isActive) {
            // Generate stars
            const newStars = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                speed: Math.random() * 3 + 1
            }));
            setStars(newStars);

            // Complete animation after duration
            const timer = setTimeout(() => {
                onComplete();
                setStars([]);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="warpGradient">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#2EB9DF" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {stars.map((star) => (
                    <line
                        key={star.id}
                        x1="50%"
                        y1="50%"
                        x2={`${star.x}%`}
                        y2={`${star.y}%`}
                        stroke="url(#warpGradient)"
                        strokeWidth="2"
                        className="animate-warp-line"
                        style={{
                            animationDuration: `${star.speed}s`,
                            opacity: 0.8
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};
