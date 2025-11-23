import React, { useState } from 'react';
import { Trash2, Check, Plus, Clock, ListTodo, Edit2, Archive } from 'lucide-react';
import { Task, Session, TimerMode } from '../types';
import { MODE_LABELS } from '../constants';

interface SidebarProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskTitle: (id: string, title: string) => void;
  history: Session[];
}

export const Sidebar: React.FC<SidebarProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTaskTitle, history }) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'history'>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      createdAt: Date.now(),
    };
    onAddTask(newTask);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      onToggleTask(id, !task.completed);
    }
  };

  const deleteTask = (id: string) => {
    onDeleteTask(id);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTaskTitle(editingId, editTitle);
    }
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }).format(new Date(ts));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
      {/* Tabs */}
      <div className="flex p-1 bg-black/10 m-3 rounded-xl">
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all duration-200 ${activeTab === 'todo' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
        >
          <ListTodo size={16} /> To-Do
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
        >
          <Clock size={16} /> History
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar relative">
        {activeTab === 'todo' ? (
          <div className="space-y-4">
            <form onSubmit={addTask} className="relative group">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full glass-input rounded-xl px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors disabled:opacity-0 opacity-100"
              >
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2">
              {tasks.length === 0 && (
                <div className="text-center text-white/30 py-12 flex flex-col items-center">
                  <Archive size={32} className="mb-3 opacity-50 stroke-[1.5]" />
                  <p className="text-sm font-light">No tasks yet. Stay focused!</p>
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${task.completed
                    ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60 hover:opacity-80'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 shadow-sm'
                    }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ${task.completed
                      ? 'bg-emerald-500/80 border-emerald-500/80 text-white scale-105'
                      : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                      }`}
                  >
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </button>

                  {editingId === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="flex-1 bg-transparent border-b border-white/50 text-white focus:outline-none pb-1 text-sm"
                      />
                    </div>
                  ) : (
                    <span className={`flex-1 text-base font-medium drop-shadow-md transition-colors ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                      {task.title}
                    </span>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!task.completed && (
                      <button onClick={() => startEdit(task)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-white/40 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="text-center text-white/30 py-12 flex flex-col items-center">
                <Clock size={32} className="mb-3 opacity-50 stroke-[1.5]" />
                <p className="text-sm font-light">No completed sessions yet.</p>
              </div>
            )}
            {[...history].reverse().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${session.mode === TimerMode.FOCUS ? 'text-emerald-300' : 'text-blue-300'
                    }`}>
                    {MODE_LABELS[session.mode]}
                  </div>
                  <div className="text-white/50 text-xs">{formatDate(session.completedAt)}</div>
                </div>
                <div className="text-white/90 font-mono text-sm font-medium bg-white/5 px-2 py-1 rounded">
                  {Math.floor(session.duration / 60)}m
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};