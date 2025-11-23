import React from 'react';
import { X, Save } from 'lucide-react';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<Settings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Settings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setLocalSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-white/5">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white tracking-wide">Settings</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Timer (Minutes)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-2">Focus</label>
                <input
                  type="number"
                  value={localSettings.focusDuration}
                  onChange={(e) => handleChange('focusDuration', e.target.value)}
                  className="glass-input w-full rounded-xl px-3 py-2.5 text-white focus:border-emerald-500/50 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-2">Short Break</label>
                <input
                  type="number"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => handleChange('shortBreakDuration', e.target.value)}
                  className="glass-input w-full rounded-xl px-3 py-2.5 text-white focus:border-blue-500/50 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-2">Long Break</label>
                <input
                  type="number"
                  value={localSettings.longBreakDuration}
                  onChange={(e) => handleChange('longBreakDuration', e.target.value)}
                  className="glass-input w-full rounded-xl px-3 py-2.5 text-white focus:border-indigo-500/50 text-center font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Goals</h3>
             <div>
                <label className="block text-xs text-white/60 mb-2">Daily Goal (Hours)</label>
                <input
                  type="number"
                  value={localSettings.dailyGoalHours}
                  onChange={(e) => handleChange('dailyGoalHours', e.target.value)}
                  className="glass-input w-full rounded-xl px-3 py-2.5 text-white focus:border-emerald-500/50"
                />
              </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/10 bg-black/10 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};