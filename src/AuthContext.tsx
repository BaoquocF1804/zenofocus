import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isGuest: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('zenfocus_token');
        const storedUser = localStorage.getItem('zenfocus_user');
        
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            
            // Verify token is still valid
            fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            })
                .then(res => {
                    if (!res.ok) {
                        // Token invalid, clear storage but continue as guest
                        localStorage.removeItem('zenfocus_token');
                        localStorage.removeItem('zenfocus_user');
                        setToken(null);
                        setUser(null);
                    }
                })
                .catch(() => {
                    // Network error, keep local state
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            localStorage.setItem('zenfocus_token', data.token);
            localStorage.setItem('zenfocus_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            localStorage.setItem('zenfocus_token', data.token);
            localStorage.setItem('zenfocus_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('zenfocus_token');
        localStorage.removeItem('zenfocus_user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                isGuest: !user || !token,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export a function to get the current token for API calls
export const getAuthToken = (): string | null => {
    return localStorage.getItem('zenfocus_token');
};
