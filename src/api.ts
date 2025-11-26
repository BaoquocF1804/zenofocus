import { Settings, Task, Session, ThemeType } from '../types';
import { getAuthToken } from './AuthContext';

const API_BASE = '/api';

// Local storage keys for guest mode
const LOCAL_KEYS = {
    settings: 'zenfocus_local_settings',
    tasks: 'zenfocus_local_tasks',
    sessions: 'zenfocus_local_sessions',
    theme: 'zenfocus_local_theme',
};

// Default settings
const DEFAULT_SETTINGS = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    dailyGoalHours: 4,
};

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

// Helper for authenticated fetch
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = { ...getAuthHeaders(), ...options.headers };
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        // Token expired or invalid - switch to guest mode
        localStorage.removeItem('zenfocus_token');
        localStorage.removeItem('zenfocus_user');
    }
    
    return response;
};

// Local storage helpers
const getLocal = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const setLocal = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const api = {
    // Settings
    getSettings: async (): Promise<Settings> => {
        if (!isAuthenticated()) {
            return getLocal(LOCAL_KEYS.settings, DEFAULT_SETTINGS);
        }
        try {
            const res = await authFetch(`${API_BASE}/settings`);
            if (!res.ok) return getLocal(LOCAL_KEYS.settings, DEFAULT_SETTINGS);
            return res.json();
        } catch {
            return getLocal(LOCAL_KEYS.settings, DEFAULT_SETTINGS);
        }
    },
    updateSettings: async (settings: Settings): Promise<void> => {
        setLocal(LOCAL_KEYS.settings, settings);
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/settings`, {
                method: 'POST',
                body: JSON.stringify(settings),
            });
        } catch {
            // Silently fail, data is saved locally
        }
    },

    // Tasks
    getTasks: async (): Promise<Task[]> => {
        if (!isAuthenticated()) {
            return getLocal(LOCAL_KEYS.tasks, []);
        }
        try {
            const res = await authFetch(`${API_BASE}/tasks`);
            if (!res.ok) return getLocal(LOCAL_KEYS.tasks, []);
            return res.json();
        } catch {
            return getLocal(LOCAL_KEYS.tasks, []);
        }
    },
    createTask: async (task: Task): Promise<void> => {
        const tasks = getLocal<Task[]>(LOCAL_KEYS.tasks, []);
        setLocal(LOCAL_KEYS.tasks, [task, ...tasks]);
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/tasks`, {
                method: 'POST',
                body: JSON.stringify(task),
            });
        } catch {
            // Silently fail
        }
    },
    updateTask: async (id: string, updates: { completed?: boolean; title?: string }): Promise<void> => {
        const tasks = getLocal<Task[]>(LOCAL_KEYS.tasks, []);
        setLocal(LOCAL_KEYS.tasks, tasks.map(t => t.id === id ? { ...t, ...updates } : t));
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/tasks/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
        } catch {
            // Silently fail
        }
    },
    deleteTask: async (id: string): Promise<void> => {
        const tasks = getLocal<Task[]>(LOCAL_KEYS.tasks, []);
        setLocal(LOCAL_KEYS.tasks, tasks.filter(t => t.id !== id));
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE',
            });
        } catch {
            // Silently fail
        }
    },

    // Sessions
    getHistory: async (): Promise<Session[]> => {
        if (!isAuthenticated()) {
            return getLocal(LOCAL_KEYS.sessions, []);
        }
        try {
            const res = await authFetch(`${API_BASE}/sessions`);
            if (!res.ok) return getLocal(LOCAL_KEYS.sessions, []);
            return res.json();
        } catch {
            return getLocal(LOCAL_KEYS.sessions, []);
        }
    },
    recordSession: async (session: Session): Promise<void> => {
        const sessions = getLocal<Session[]>(LOCAL_KEYS.sessions, []);
        setLocal(LOCAL_KEYS.sessions, [...sessions, session]);
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/sessions`, {
                method: 'POST',
                body: JSON.stringify(session),
            });
        } catch {
            // Silently fail
        }
    },

    // Theme
    getTheme: async (): Promise<ThemeType> => {
        if (!isAuthenticated()) {
            return getLocal(LOCAL_KEYS.theme, 'nature' as ThemeType);
        }
        try {
            const res = await authFetch(`${API_BASE}/theme`);
            if (!res.ok) return getLocal(LOCAL_KEYS.theme, 'nature' as ThemeType);
            return res.json();
        } catch {
            return getLocal(LOCAL_KEYS.theme, 'nature' as ThemeType);
        }
    },
    updateTheme: async (theme: ThemeType): Promise<void> => {
        setLocal(LOCAL_KEYS.theme, theme);
        if (!isAuthenticated()) return;
        try {
            await authFetch(`${API_BASE}/theme`, {
                method: 'POST',
                body: JSON.stringify({ theme }),
            });
        } catch {
            // Silently fail
        }
    },
};
