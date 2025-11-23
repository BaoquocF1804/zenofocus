import React from 'react';
import { WeatherType } from '../types';

interface WeatherOverlayProps {
    type: WeatherType;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ type }) => {
    if (type === 'none') return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Rain Effect - Improved */}
            {type === 'rain' && (
                <div className="absolute inset-0">
                    {[...Array(100)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-gradient-to-b from-blue-200/80 to-blue-300/40 animate-rain-drop"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 100}px`,
                                width: '2px',
                                height: `${Math.random() * 20 + 10}px`,
                                animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Snow Effect - Enhanced */}
            {type === 'snow' && (
                <div className="absolute inset-0">
                    {[...Array(80)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full opacity-80 animate-snow shadow-sm"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                width: `${Math.random() * 6 + 2}px`,
                                height: `${Math.random() * 6 + 2}px`,
                                animationDuration: `${Math.random() * 5 + 5}s`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Fog Effect - New */}
            {type === 'fog' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-200/20 via-gray-300/30 to-transparent animate-fog-1" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-200/20 via-gray-300/20 to-transparent animate-fog-2" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-fog-3" />
                </>
            )}

            {/* Particles/Stars Effect - New */}
            {type === 'particles' && (
                <div className="absolute inset-0">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full animate-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes rain-drop {
                    0% { 
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { 
                        transform: translateY(100vh) translateX(10px);
                        opacity: 0;
                    }
                }
                
                @keyframes snow {
                    0% { 
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { 
                        transform: translateY(100vh) translateX(30px) rotate(360deg);
                        opacity: 0;
                    }
                }

                @keyframes fog-1 {
                    0%, 100% { transform: translateX(-10%) translateY(0); opacity: 0.3; }
                    50% { transform: translateX(10%) translateY(-5%); opacity: 0.5; }
                }

                @keyframes fog-2 {
                    0%, 100% { transform: translateX(10%) translateY(0); opacity: 0.4; }
                    50% { transform: translateX(-10%) translateY(5%); opacity: 0.6; }
                }

                @keyframes fog-3 {
                    0%, 100% { transform: translateX(-20%); opacity: 0.2; }
                    50% { transform: translateX(20%); opacity: 0.4; }
                }

                @keyframes particle {
                    0%, 100% { 
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
                
                .animate-rain-drop {
                    animation: rain-drop linear infinite;
                }
                
                .animate-snow {
                    animation: snow linear infinite;
                }

                .animate-fog-1 {
                    animation: fog-1 20s ease-in-out infinite;
                }

                .animate-fog-2 {
                    animation: fog-2 25s ease-in-out infinite;
                }

                .animate-fog-3 {
                    animation: fog-3 30s ease-in-out infinite;
                }

                .animate-particle {
                    animation: particle ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
