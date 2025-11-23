import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Settings as SettingsIcon,
  Maximize, Minimize, Palette, Coffee, Clock, ListTodo, Moon, Sun
} from 'lucide-react';
import {
  TimerMode, ThemeType, Settings, Task, Session, WeatherType
} from './types';
import {
  DEFAULT_SETTINGS, THEMES, MOOD_CHANNELS, SMART_TIPS, MODE_LABELS
} from './constants';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { ThemeSelector } from './components/ThemeSelector';
import { WeatherOverlay } from './components/WeatherOverlay';

import { BrownNoise } from './components/BrownNoise';
import { api } from './src/api';

// Sound effect for timer completion
const playNotification = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Bell sound
  audio.volume = 0.7;
  audio.play().catch(() => { }); // Catch play promise errors (autoplay policy)
};

// Sound effect for button clicks
const playClickSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3'); // Click sound
  audio.volume = 0.3;
  audio.play().catch(() => { });
};

// Sound effect for pause
const playPauseSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Soft click
  audio.volume = 0.4;
  audio.play().catch(() => { });
};

// Sound effect for audio/mood selection
const playAudioSelectSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'); // UI sound
  audio.volume = 0.3;
  audio.play().catch(() => { });
};

const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg)($|\?)/i.test(url);
};

const App: React.FC = () => {
  // --- Persisted State ---
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<ThemeType>(ThemeType.NATURE);
  const [weather, setWeather] = useState<WeatherType>('none');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<Session[]>([]);

  // --- Runtime State ---
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [bgImage, setBgImage] = useState(THEMES[theme].bgImage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMoodId, setActiveMoodId] = useState<string | null>(null);
  const [randomTip, setRandomTip] = useState('');
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ref for interval to clear it properly
  const intervalRef = useRef<number | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedSettings, fetchedTheme, fetchedTasks, fetchedHistory] = await Promise.all([
          api.getSettings(),
          api.getTheme(),
          api.getTasks(),
          api.getHistory()
        ]);
        setSettings(fetchedSettings);
        setTheme(fetchedTheme);
        setTasks(fetchedTasks);
        setHistory(fetchedHistory);
        // Update timer based on fetched settings if not active
        if (!isActive) {
          setTimeLeft(fetchedSettings.focusDuration * 60);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchData();
  }, []);

  // --- Persistence Effects ---
  const handleSettingsChange = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      await api.updateSettings(newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  // Update background when theme changes
  const handleThemeChange = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    setBgImage(THEMES[newTheme].bgImage); // Added this line
    try {
      await api.updateTheme(newTheme);
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const handleBackgroundChange = (url: string) => {
    setBgImage(url);
  };

  // Note: Tasks are handled via Sidebar, but we need to make sure Sidebar calls API or we wrap setTasks.
  // Since Sidebar takes setTasks, we might need to modify Sidebar or pass a wrapped setter.
  // For now, let's assume Sidebar manages local state and we sync, or better, pass callbacks.
  // However, looking at Sidebar usage: <Sidebar tasks={tasks} setTasks={setTasks} ... />
  // We should probably modify Sidebar to use API, OR wrap setTasks here.
  // Wrapping setTasks is tricky if Sidebar uses functional updates.
  // Let's modify Sidebar to accept callbacks instead of setTasks, or intercept changes.
  // Actually, the easiest way without refactoring Sidebar too much is to let Sidebar call API.
  // But Sidebar is a child. Let's see Sidebar code first.
  // Assuming I will refactor Sidebar to take onAdd, onToggle, onDelete props.

  // --- Timer Logic ---
  // Reset timer when settings change or mode changes (if not active)
  useEffect(() => {
    if (!isActive) {
      resetTimer(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // When switching to break, generate a tip
  useEffect(() => {
    if (mode !== TimerMode.FOCUS) {
      setRandomTip(SMART_TIPS[Math.floor(Math.random() * SMART_TIPS.length)]);
    }
  }, [mode]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    playNotification();

    // Record History if Focus
    if (mode === TimerMode.FOCUS) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        mode: TimerMode.FOCUS,
        duration: settings.focusDuration * 60,
        completedAt: Date.now(),
      };
      setHistory(prev => [...prev, newSession]);
      try {
        await api.recordSession(newSession);
      } catch (error) {
        console.error("Failed to record session:", error);
      }

      // Auto-switch to break
      setMode(TimerMode.SHORT_BREAK);
    } else {
      // Auto-switch to focus
      setMode(TimerMode.FOCUS);
    }
  };

  const resetTimer = (targetMode: TimerMode = mode) => {
    setIsActive(false);
    let duration = settings.focusDuration;
    if (targetMode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
    if (targetMode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    resetTimer(newMode);
  };

  const toggleTimer = () => {
    if (!isActive) {
      playClickSound();
    } else {
      playPauseSound();
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };



  // --- Derived Data ---
  const currentTheme = THEMES[theme];

  // Calculate daily progress
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysFocusSeconds = history
    .filter(h => h.completedAt >= today && h.mode === TimerMode.FOCUS)
    .reduce((acc, curr) => acc + curr.duration, 0);
  const goalSeconds = settings.dailyGoalHours * 3600;
  const progressPercent = Math.min((todaysFocusSeconds / goalSeconds) * 100, 100);

  return (
    <div
      className={`min-h-screen w-full bg-cover bg-center transition-all duration-700 ease-in-out flex items-center justify-center p-4 md:p-8`}
      style={{ backgroundImage: isVideo(bgImage) ? 'none' : `url(${bgImage})` }}
    >
      {isVideo(bgImage) && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          src={bgImage}
          onError={(e) => {
            console.error("Video failed to load:", bgImage);
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/30' : 'bg-black/10'
        }`}></div>
      <WeatherOverlay type={weather} />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[85vh] lg:h-[85vh] h-auto">

        {/* Left Column - Main Focus Area */}
        <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-none">

          {/* Timer Card */}
          <div className="flex-1 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[50vh] lg:min-h-0">
            {/* Header */}
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <div className="p-2 bg-white/5 rounded-lg">
                <Coffee size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">ZenFocus</span>
            </div>


            {/* Mode Toggles */}
            <div className="flex p-1 bg-black/10 rounded-full mb-8 md:mb-12 backdrop-blur-[2px] scale-90 md:scale-100">
              {[TimerMode.FOCUS, TimerMode.SHORT_BREAK, TimerMode.LONG_BREAK].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${mode === m
                    ? 'bg-white text-black shadow-sm scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-white leading-none tracking-tighter drop-shadow-lg select-none font-[Inter] tabular-nums mb-8 transition-all duration-300">
              {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={toggleTimer}
                className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group"
              >
                {isActive ? (
                  <Pause size={28} className="fill-current md:w-8 md:h-8" />
                ) : (
                  <Play size={28} className="fill-current ml-1 md:w-8 md:h-8" />
                )}
              </button>

              <button
                onClick={() => resetTimer()}
                className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 hover:rotate-180 transition-all duration-500 backdrop-blur-sm border border-white/5"
              >
                <RotateCcw size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Stats & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 gap-4 md:gap-0">
            {/* Daily Goal */}
            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col gap-2">
                <span className="text-white/60 text-xs font-bold tracking-wider uppercase">Daily Goal</span>
                <div className="w-24 h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-white font-mono text-sm mt-5">{Math.floor(todaysFocusSeconds / 60)} / {settings.dailyGoalHours * 60} min</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={() => setIsPanelVisible(!isPanelVisible)}
                className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isPanelVisible ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'
                  }`}
                title="Toggle Tasks Panel"
              >
                <ListTodo size={20} />
              </button>
              <div className="w-px h-4 bg-white/10"></div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isDarkMode ? 'text-white' : 'text-yellow-300'
                  }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <div className="w-px h-4 bg-white/10"></div>
              <button
                onClick={() => setIsThemeSelectorOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                title="Change Theme"
              >
                <Palette size={20} />
              </button>
              <div className="w-px h-4 bg-white/10"></div>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar & Tools */}
        <div className="flex flex-col gap-6 h-full overflow-hidden order-2 lg:order-none min-h-[500px] lg:min-h-0">

          {/* Audio Focus Card */}
          <div className="glass-panel rounded-3xl p-6 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-xs font-bold tracking-wider uppercase">Audio Focus</span>
              {activeMoodId && (
                <div className="flex gap-1">
                  <span className="animate-bounce text-[10px] text-emerald-400">●</span>
                  <span className="animate-bounce delay-100 text-[10px] text-emerald-400">●</span>
                  <span className="animate-bounce delay-200 text-[10px] text-emerald-400">●</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOOD_CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    playAudioSelectSound();
                    setActiveMoodId(activeMoodId === channel.id ? null : channel.id);
                  }}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${activeMoodId === channel.id
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-black/10 text-white/70 hover:bg-black/20 hover:text-white'
                    }`}
                >
                  <span className="text-lg">{channel.icon}</span>
                  <span className="text-xs font-medium truncate">{channel.name}</span>
                </button>
              ))}
            </div>

            {/* Hidden Iframe for Audio */}
            {activeMoodId && (
              <div className="mt-4 aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black/20">
                <iframe
                  width="100%"
                  height="100%"
                  src={
                    MOOD_CHANNELS.find(c => c.id === activeMoodId)?.type === 'live'
                      ? `https://www.youtube.com/embed/live_stream?channel=${MOOD_CHANNELS.find(c => c.id === activeMoodId)?.videoId}&autoplay=1&controls=0&modestbranding=1&loop=1`
                      : `https://www.youtube.com/embed/${MOOD_CHANNELS.find(c => c.id === activeMoodId)?.videoId}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${MOOD_CHANNELS.find(c => c.id === activeMoodId)?.videoId}`
                  }
                  title="Mood Music"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5">
              <BrownNoise />
            </div>
          </div>

          {/* Tasks & History Sidebar - Collapsible */}
          {isPanelVisible && (
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[300px] animate-fade-in-up">
              <Sidebar
                tasks={tasks}
                onAddTask={async (task) => {
                  setTasks(prev => [task, ...prev]);
                  try {
                    await api.createTask(task);
                  } catch (error) {
                    console.error("Failed to create task:", error);
                  }
                }}
                onToggleTask={async (id, completed) => {
                  setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
                  try {
                    await api.updateTask(id, { completed });
                  } catch (error) {
                    console.error("Failed to update task:", error);
                  }
                }}
                onDeleteTask={async (id) => {
                  setTasks(prev => prev.filter(t => t.id !== id));
                  try {
                    await api.deleteTask(id);
                  } catch (error) {
                    console.error("Failed to delete task:", error);
                  }
                }}
                onUpdateTaskTitle={async (id, title) => {
                  setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
                  try {
                    await api.updateTask(id, { title });
                  } catch (error) {
                    console.error("Failed to update task title:", error);
                  }
                }}
                history={history}
              />
            </div>
          )}

        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsChange}
      />

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleThemeChange}
        onSelectBackground={handleBackgroundChange}
        currentWeather={weather}
        onSelectWeather={setWeather}
      />
    </div>
  );
};

export default App;