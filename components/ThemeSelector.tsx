import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Sun, Play, Camera, Upload, CloudRain, CloudSnow, CloudOff, Cloud, Sparkles, Trash2, Check } from 'lucide-react';
import { ThemeType, WeatherType } from '../types';
import { THEMES, BACKGROUND_IMAGES, MOTION_BACKGROUNDS } from '../constants';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: ThemeType;
    onSelectTheme: (theme: ThemeType) => void;
    onSelectBackground: (url: string) => void;
    currentWeather: WeatherType;
    onSelectWeather: (weather: WeatherType) => void;
}

// Local storage key for custom backgrounds
const CUSTOM_BACKGROUNDS_KEY = 'zenfocus_custom_backgrounds';

// Get custom backgrounds from localStorage
const getCustomBackgrounds = (): string[] => {
    try {
        const stored = localStorage.getItem(CUSTOM_BACKGROUNDS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save custom backgrounds to localStorage
const saveCustomBackgrounds = (backgrounds: string[]) => {
    localStorage.setItem(CUSTOM_BACKGROUNDS_KEY, JSON.stringify(backgrounds));
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    isOpen,
    onClose,
    currentTheme,
    onSelectTheme,
    onSelectBackground,
    currentWeather,
    onSelectWeather,
}) => {
    const [activeTab, setActiveTab] = useState<'background' | 'weather'>('background');
    const [activeSubTab, setActiveSubTab] = useState<'motion' | 'stills' | 'personalize'>('stills');
    const [customBackgrounds, setCustomBackgrounds] = useState<string[]>(getCustomBackgrounds);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');
        
        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            setUploadError('Please select a JPG, PNG, GIF, or WebP image');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Image must be less than 10MB');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64 for local storage
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                const newBackgrounds = [base64, ...customBackgrounds].slice(0, 10); // Keep max 10
                setCustomBackgrounds(newBackgrounds);
                saveCustomBackgrounds(newBackgrounds);
                onSelectBackground(base64);
                setIsUploading(false);
            };
            reader.onerror = () => {
                setUploadError('Failed to read image');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setUploadError('Failed to upload image');
            setIsUploading(false);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const deleteCustomBackground = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newBackgrounds = customBackgrounds.filter((_, i) => i !== index);
        setCustomBackgrounds(newBackgrounds);
        saveCustomBackgrounds(newBackgrounds);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Set your study scene</h2>

                        {/* Main Tabs */}
                        <div className="flex gap-1 p-1 bg-white/5 rounded-full w-fit mb-6">
                            <button
                                onClick={() => setActiveTab('background')}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${activeTab === 'background'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <ImageIcon size={16} />
                                Background
                            </button>
                            <button
                                onClick={() => setActiveTab('weather')}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${activeTab === 'weather'
                                    ? 'bg-white/10 text-white shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Sun size={16} />
                                Weather
                            </button>
                        </div>

                        {/* Sub Tabs */}
                        {activeTab === 'background' && (
                            <div className="flex gap-8 border-b border-white/10 w-full min-w-[600px]">
                                <button
                                    onClick={() => setActiveSubTab('motion')}
                                    className={`pb-3 text-sm font-medium transition-all relative ${activeSubTab === 'motion' ? 'text-white' : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    Motion
                                    {activeSubTab === 'motion' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveSubTab('stills')}
                                    className={`pb-3 text-sm font-medium transition-all relative ${activeSubTab === 'stills' ? 'text-white' : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    Stills
                                    {activeSubTab === 'stills' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveSubTab('personalize')}
                                    className={`pb-3 text-sm font-medium transition-all relative ${activeSubTab === 'personalize' ? 'text-white' : 'text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    Personalize
                                    {activeSubTab === 'personalize' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'background' && activeSubTab === 'stills' && (
                        <div className="space-y-8">
                            {['Nature', 'Urban', 'Minimal', 'Tech'].map((category) => (
                                <div key={category}>
                                    <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {BACKGROUND_IMAGES.filter(img => img.category === category).map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => onSelectBackground(img.url)}
                                                className="group relative aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-white/50 transition-all"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                    <span className="text-white font-medium">{img.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'background' && activeSubTab === 'motion' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MOTION_BACKGROUNDS.map((bg) => (
                                <div
                                    key={bg.id}
                                    onClick={() => onSelectBackground(bg.url)}
                                    className="group relative aspect-video rounded-xl overflow-hidden border-2 border-white/5 bg-white/5 hover:border-white/20 transition-all cursor-pointer"
                                >
                                    <img
                                        src={bg.thumbnail}
                                        alt={bg.name}
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Play size={20} className="text-white fill-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white font-medium shadow-black/50 drop-shadow-md">{bg.name}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'background' && activeSubTab === 'personalize' && (
                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div 
                                onClick={handleUploadClick}
                                className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {isUploading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Upload size={28} className="text-white/80" />
                                    )}
                                </div>
                                <h3 className="text-white font-medium mb-1">Upload your own photo</h3>
                                <p className="text-white/40 text-sm">Click to browse • JPG, PNG, GIF, WebP • Max 10MB</p>
                                {uploadError && (
                                    <p className="text-red-400 text-sm mt-2">{uploadError}</p>
                                )}
                            </div>

                            {/* Custom Backgrounds Grid */}
                            {customBackgrounds.length > 0 && (
                                <div>
                                    <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">Your Photos</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {customBackgrounds.map((bg, index) => (
                                            <div
                                                key={index}
                                                onClick={() => onSelectBackground(bg)}
                                                className="group relative aspect-video rounded-xl overflow-hidden border-2 border-white/10 hover:border-white/50 transition-all cursor-pointer"
                                            >
                                                <img
                                                    src={bg}
                                                    alt={`Custom ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                                        <Check size={16} className="text-white" />
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteCustomBackground(index, e)}
                                                        className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} className="text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'weather' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { type: 'none', icon: <CloudOff size={24} />, label: 'None' },
                                { type: 'rain', icon: <CloudRain size={24} />, label: 'Rain' },
                                { type: 'snow', icon: <CloudSnow size={24} />, label: 'Snow' },
                                { type: 'fog', icon: <Cloud size={24} />, label: 'Fog' },
                                { type: 'particles', icon: <Sparkles size={24} />, label: 'Particles' },
                            ].map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() => onSelectWeather(option.type as WeatherType)}
                                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all ${currentWeather === option.type
                                        ? 'border-white bg-white/10 text-white'
                                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {option.icon}
                                    <span className="font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
