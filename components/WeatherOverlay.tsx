import React, { useMemo } from 'react';
import { WeatherType } from '../types';

interface WeatherOverlayProps {
    type: WeatherType;
}

// Generate stable random values outside component to prevent re-renders
const generateParticles = (count: number, config: { 
    minSize: number; 
    maxSize: number;
    minDuration: number;
    maxDuration: number;
    maxDelay: number;
}) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
        duration: Math.random() * (config.maxDuration - config.minDuration) + config.minDuration,
        delay: Math.random() * config.maxDelay,
    }));
};

// Pre-generate all particles once
const rainParticles = generateParticles(100, { minSize: 10, maxSize: 30, minDuration: 0.5, maxDuration: 1, maxDelay: 2 });
const snowParticles = generateParticles(80, { minSize: 2, maxSize: 8, minDuration: 5, maxDuration: 10, maxDelay: 5 });
const starParticles = generateParticles(60, { minSize: 1, maxSize: 4, minDuration: 2, maxDuration: 5, maxDelay: 3 });

export const WeatherOverlay: React.FC<WeatherOverlayProps> = React.memo(({ type }) => {
    if (type === 'none') return null;

    return (
        <div className="weather-overlay">
            {/* Rain Effect */}
            {type === 'rain' && (
                <div className="weather-container">
                    {rainParticles.map((p) => (
                        <div
                            key={p.id}
                            className="rain-drop"
                            style={{
                                left: `${p.left}%`,
                                top: `-${p.top}px`,
                                height: `${p.size}px`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Snow Effect */}
            {type === 'snow' && (
                <div className="weather-container">
                    {snowParticles.map((p) => (
                        <div
                            key={p.id}
                            className="snow-flake"
                            style={{
                                left: `${p.left}%`,
                                top: `-20px`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Fog Effect */}
            {type === 'fog' && (
                <>
                    <div className="fog-layer fog-1" />
                    <div className="fog-layer fog-2" />
                    <div className="fog-layer fog-3" />
                </>
            )}

            {/* Particles/Stars Effect */}
            {type === 'particles' && (
                <div className="weather-container">
                    {starParticles.map((p) => (
                        <div
                            key={p.id}
                            className="star-particle"
                            style={{
                                left: `${p.left}%`,
                                top: `${p.top}%`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <style>{`
                .weather-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                    overflow: hidden;
                }

                .weather-container {
                    position: absolute;
                    inset: 0;
                }

                /* Rain */
                .rain-drop {
                    position: absolute;
                    width: 2px;
                    background: linear-gradient(to bottom, rgba(147, 197, 253, 0.8), rgba(147, 197, 253, 0.3));
                    border-radius: 2px;
                    animation: rain-fall linear infinite;
                    will-change: transform;
                }

                @keyframes rain-fall {
                    0% { 
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { 
                        transform: translateY(100vh) translateX(10px);
                        opacity: 0;
                    }
                }

                /* Snow */
                .snow-flake {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    opacity: 0.9;
                    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
                    animation: snow-fall linear infinite;
                    will-change: transform;
                }

                @keyframes snow-fall {
                    0% { 
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    5% { opacity: 0.9; }
                    95% { opacity: 0.9; }
                    100% { 
                        transform: translateY(100vh) translateX(50px) rotate(360deg);
                        opacity: 0;
                    }
                }

                /* Fog */
                .fog-layer {
                    position: absolute;
                    inset: 0;
                    will-change: transform, opacity;
                }

                .fog-1 {
                    background: linear-gradient(to bottom, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0.25), transparent);
                    animation: fog-move-1 20s ease-in-out infinite;
                }

                .fog-2 {
                    background: linear-gradient(to top, rgba(200, 200, 200, 0.15), rgba(200, 200, 200, 0.2), transparent);
                    animation: fog-move-2 25s ease-in-out infinite;
                }

                .fog-3 {
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
                    animation: fog-move-3 30s ease-in-out infinite;
                }

                @keyframes fog-move-1 {
                    0%, 100% { transform: translateX(-10%) translateY(0); opacity: 0.3; }
                    50% { transform: translateX(10%) translateY(-5%); opacity: 0.5; }
                }

                @keyframes fog-move-2 {
                    0%, 100% { transform: translateX(10%) translateY(0); opacity: 0.4; }
                    50% { transform: translateX(-10%) translateY(5%); opacity: 0.6; }
                }

                @keyframes fog-move-3 {
                    0%, 100% { transform: translateX(-20%); opacity: 0.2; }
                    50% { transform: translateX(20%); opacity: 0.4; }
                }

                /* Particles/Stars */
                .star-particle {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
                    animation: star-twinkle ease-in-out infinite;
                    will-change: transform, opacity;
                }

                @keyframes star-twinkle {
                    0%, 100% { 
                        opacity: 0.2;
                        transform: scale(0.5);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
});

WeatherOverlay.displayName = 'WeatherOverlay';
