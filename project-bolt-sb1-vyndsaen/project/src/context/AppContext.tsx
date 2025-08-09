import React, { createContext, useContext, useState } from 'react';
import { Task, Goal, Note, Reminder, TimerSession, TimetableSlot, AppSettings } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AppContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  
  // Timer
  timerSessions: TimerSession[];
  addTimerSession: (session: Omit<TimerSession, 'id'>) => void;
  
  // Timetable
  timetableSlots: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Timer state
  isTimerRunning: boolean;
  currentTimer: { type: string; timeLeft: number; category?: string } | null;
  setTimerState: (running: boolean, timer?: { type: string; timeLeft: number; category?: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('moxoz-tasks', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('moxoz-goals', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('moxoz-notes', []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('moxoz-reminders', []);
  const [timerSessions, setTimerSessions] = useLocalStorage<TimerSession[]>('moxoz-timer-sessions', []);
  const [timetableSlots, setTimetableSlots] = useLocalStorage<TimetableSlot[]>('moxoz-timetable', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('moxoz-settings', {
    theme: 'dark',
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    notifications: true
  });
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{ type: string; timeLeft: number; category?: string } | null>(null);

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Goal functions
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Note functions
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  // Reminder functions
  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  // Timer functions
  const addTimerSession = (session: Omit<TimerSession, 'id'>) => {
    const newSession: TimerSession = {
      ...session,
      id: Date.now().toString()
    };
    setTimerSessions([...timerSessions, newSession]);
  };

  // Timetable functions
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: Date.now().toString()
    };
    setTimetableSlots([...timetableSlots, newSlot]);
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetableSlots(timetableSlots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetableSlots(timetableSlots.filter(slot => slot.id !== id));
  };

  // Settings functions
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  // Timer state functions
  const setTimerState = (running: boolean, timer?: { type: string; timeLeft: number; category?: string } | null) => {
    setIsTimerRunning(running);
    setCurrentTimer(timer || null);
  };

  const value = {
    tasks, addTask, updateTask, deleteTask,
    goals, addGoal, updateGoal, deleteGoal,
    notes, addNote, updateNote, deleteNote,
    reminders, addReminder, updateReminder, deleteReminder,
    timerSessions, addTimerSession,
    timetableSlots, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot,
    settings, updateSettings,
    isTimerRunning, currentTimer, setTimerState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};