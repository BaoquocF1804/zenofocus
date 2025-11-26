import React, { useState } from 'react';
import { Trash2, Check, Plus, Clock, ListTodo, Edit2, Archive } from 'lucide-react';
import { Task, Session, TimerMode } from '../types';
import { MODE_LABELS } from '../constants';
import { generateUUID } from '../src/utils';

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
    e.stopPropagation();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: generateUUID(),
      title: newTaskTitle,
      completed: false,
      createdAt: Date.now(),
    };
    onAddTask(newTask);
    setNewTaskTitle('');
  };

  const toggleTask = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (task) {
      onToggleTask(id, !task.completed);
    }
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteTask(id);
  };

  const startEdit = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Toggle */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex p-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${activeTab === 'todo' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <ListTodo size={16} />
            <span>To-Do</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Clock size={16} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'todo' ? (
          <div className="space-y-3">
            {/* Add Task Form */}
            <form onSubmit={addTask} className="relative">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 bg-black/30 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-black/40 transition-all"
              />
              {newTaskTitle.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              )}
            </form>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.length === 0 && (
                <div className="text-center text-white/30 py-10 flex flex-col items-center">
                  <Archive size={28} className="mb-2 opacity-50" />
                  <p className="text-sm">No tasks yet. Stay focused!</p>
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${task.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20 opacity-70'
                    : 'bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20'
                    }`}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleTask(e, task.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                      }`}
                  >
                    {task.completed && <Check size={12} strokeWidth={3} />}
                  </button>

                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-transparent border-b border-white/50 text-white text-sm focus:outline-none pb-0.5"
                    />
                  ) : (
                    <span className={`flex-1 text-sm font-medium transition-colors ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                      {task.title}
                    </span>
                  )}

                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!task.completed && (
                      <button 
                        type="button"
                        onClick={(e) => startEdit(e, task)} 
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => deleteTask(e, task.id)} 
                      className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.length === 0 && (
              <div className="text-center text-white/30 py-10 flex flex-col items-center">
                <Clock size={28} className="mb-2 opacity-50" />
                <p className="text-sm">No completed sessions yet.</p>
              </div>
            )}
            {[...history].reverse().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/10 hover:bg-black/30 transition-colors">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${session.mode === TimerMode.FOCUS ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                    {MODE_LABELS[session.mode]}
                  </div>
                  <div className="text-white/40 text-xs">{formatDate(session.completedAt)}</div>
                </div>
                <div className="text-white/80 font-mono text-sm bg-white/5 px-2 py-1 rounded">
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
