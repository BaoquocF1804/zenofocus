import { Settings, Task, Session, ThemeType } from '../types';

const API_BASE = '/api';

export const api = {
    // Settings
    getSettings: async (): Promise<Settings> => {
        const res = await fetch(`${API_BASE}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },
    updateSettings: async (settings: Settings): Promise<void> => {
        await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
    },

    // Tasks
    getTasks: async (): Promise<Task[]> => {
        const res = await fetch(`${API_BASE}/tasks`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    },
    createTask: async (task: Task): Promise<void> => {
        await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
    },
    updateTask: async (id: string, updates: { completed?: boolean; title?: string }): Promise<void> => {
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    },
    deleteTask: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    // Sessions
    getHistory: async (): Promise<Session[]> => {
        const res = await fetch(`${API_BASE}/sessions`);
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
    },
    recordSession: async (session: Session): Promise<void> => {
        await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session),
        });
    },

    // Theme
    getTheme: async (): Promise<ThemeType> => {
        const res = await fetch(`${API_BASE}/theme`);
        if (!res.ok) throw new Error('Failed to fetch theme');
        return res.json();
    },
    updateTheme: async (theme: ThemeType): Promise<void> => {
        await fetch(`${API_BASE}/theme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme }),
        });
    },
};
