import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../src/AuthContext';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;
            if (mode === 'login') {
                result = await login(email, password);
            } else {
                result = await register(email, password, name);
            }

            if (!result.success) {
                setError(result.error || 'Something went wrong');
            } else {
                onSuccess?.();
                onClose();
                // Reload to fetch user data
                window.location.reload();
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div 
                className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl border animate-scale-in"
                style={{
                    background: 'linear-gradient(145deg, #0E0E0F 0%, #1F2937 100%)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Glow effect */}
                <div 
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)' }}
                ></div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 text-sm mb-2" style={{ color: '#3B82F6' }}>
                        <Zap size={16} />
                        <span className="font-medium">Sync your data</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {mode === 'login' 
                            ? 'Sign in to sync your progress across devices' 
                            : 'Create an account to save your data'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div 
                    className="flex p-1 rounded-xl mb-6"
                    style={{ backgroundColor: '#0E0E0F' }}
                >
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            mode === 'login'
                                ? 'text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={mode === 'login' ? { 
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                        } : {}}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            mode === 'register'
                                ? 'text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={mode === 'register' ? { 
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                        } : {}}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name field (only for register) */}
                    {mode === 'register' && (
                        <div className="space-y-1.5">
                            <label className="text-gray-400 text-xs font-medium block">
                                Your Name
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="What should we call you?"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-300"
                                    style={{ 
                                        backgroundColor: '#0E0E0F',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email field */}
                    <div className="space-y-1.5">
                        <label className="text-gray-400 text-xs font-medium block">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-300"
                                style={{ 
                                    backgroundColor: '#0E0E0F',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'}
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5">
                        <label className="text-gray-400 text-xs font-medium block">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all duration-300"
                                style={{ 
                                    backgroundColor: '#0E0E0F',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div 
                            className="p-3 rounded-xl text-sm"
                            style={{ 
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171'
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        style={{ 
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        {isLoading ? (
                            <div 
                                className="w-5 h-5 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                            ></div>
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Switch mode link */}
                <p className="text-center text-gray-500 text-sm mt-5">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={switchMode}
                        className="font-medium transition-colors hover:underline"
                        style={{ color: '#93C5FD' }}
                    >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>

            {/* Custom styles */}
            <style>{`
                @keyframes scale-in {
                    from { 
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-scale-in {
                    animation: scale-in 0.25s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
