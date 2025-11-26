import { MoodChannel, ThemeConfig, ThemeType, TimerMode } from './types';

export const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  dailyGoalHours: 4,
};

export const THEMES: Record<ThemeType, ThemeConfig> = {
  [ThemeType.NATURE]: {
    name: 'Nature',
    bgImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2560&auto=format&fit=crop',
    primaryColor: 'bg-emerald-500',
    accentColor: 'text-emerald-300',
    textColor: 'text-white',
  },
  [ThemeType.LOFI]: {
    name: 'Lofi',
    bgImage: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=2560&auto=format&fit=crop',
    primaryColor: 'bg-purple-500',
    accentColor: 'text-purple-300',
    textColor: 'text-white',
  },
  [ThemeType.TECH]: {
    name: 'Tech',
    bgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2560&auto=format&fit=crop',
    primaryColor: 'bg-cyan-500',
    accentColor: 'text-cyan-300',
    textColor: 'text-cyan-50',
  },
  [ThemeType.VINTAGE]: {
    name: 'Vintage',
    bgImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2560&auto=format&fit=crop',
    primaryColor: 'bg-amber-600',
    accentColor: 'text-amber-800',
    textColor: 'text-amber-900',
  },
};

export const BACKGROUND_IMAGES = [
  // Nature
  { id: 'nature-1', name: 'Misty Forest', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop', category: 'Nature' },
  { id: 'nature-2', name: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=2560&auto=format&fit=crop', category: 'Nature' },
  { id: 'nature-3', name: 'Rainy Window', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2560&auto=format&fit=crop', category: 'Nature' },
  { id: 'nature-4', name: 'Autumn Path', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop', category: 'Nature' },

  // Urban / Cafe
  { id: 'urban-1', name: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2560&auto=format&fit=crop', category: 'Urban' },
  { id: 'urban-2', name: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2560&auto=format&fit=crop', category: 'Urban' },

  // Minimal / Abstract
  { id: 'minimal-1', name: 'Lofi Room', url: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=2560&auto=format&fit=crop', category: 'Minimal' },
  { id: 'minimal-2', name: 'Abstract Waves', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop', category: 'Minimal' },

  // Tech
  { id: 'tech-1', name: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2560&auto=format&fit=crop', category: 'Tech' },
  { id: 'tech-2', name: 'Developer Desk', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2560&auto=format&fit=crop', category: 'Tech' },
  { id: 'tech-3', name: 'Space Station', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop', category: 'Tech' },
];

export const MOTION_BACKGROUNDS = [
  {
    id: 'motion-1',
    name: 'Rainy Window',
    url: 'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534274988754-c6a60bf93217?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-2',
    name: 'Cozy Fireplace',
    url: 'https://cdn.pixabay.com/video/2021/01/22/63052-503841416_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1543931036-50a47c9a7c5f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-3',
    name: 'Ocean Waves',
    url: 'https://cdn.pixabay.com/video/2024/06/02/214742_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-4',
    name: 'Night City Drive',
    url: 'https://cdn.pixabay.com/video/2020/07/30/46026-445569498_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-5',
    name: 'Aurora Borealis',
    url: 'https://cdn.pixabay.com/video/2019/07/17/25123-349043616_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-6',
    name: 'Clouds Timelapse',
    url: 'https://cdn.pixabay.com/video/2016/09/21/5373-183629078_large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-7',
    name: 'Forest Path',
    url: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'motion-8',
    name: 'Starry Night',
    url: 'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600&auto=format&fit=crop'
  }
];

export const MOOD_CHANNELS: MoodChannel[] = [
  { id: 'lofi', name: 'Lofi Girl', videoId: 'JdqL89ZZwFw', icon: '🎧', type: 'video' },
  { id: 'piano', name: 'Peaceful Piano', videoId: 'CnPwgYo8aNk', icon: '🎹', type: 'video' },
  { id: 'forest', name: 'Forest Nature', videoId: 'STSB9Xjeznw', icon: '🌲', type: 'video' },
  { id: 'synth', name: 'Coding Synth', videoId: '4xDzrJKXOOY', icon: '💻', type: 'video' },
];

export const SMART_TIPS = [
  "Time to stretch! Reach for the sky.",
  "20-20-20 Rule: Look at something 20ft away for 20s.",
  "Hydrate! Drink a glass of water.",
  "Take a deep breath. Inhale... Exhale...",
  "Walk around the room for a minute.",
  "Rest your eyes. Close them for 30 seconds.",
  "Roll your shoulders back and release tension.",
];

export const MODE_LABELS: Record<TimerMode, string> = {
  [TimerMode.FOCUS]: 'Focus',
  [TimerMode.SHORT_BREAK]: 'Short Break',
  [TimerMode.LONG_BREAK]: 'Long Break',
};