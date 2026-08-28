/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DayOfWeek,
  NavTab,
  Priority,
  Task,
  WeekPlan,
} from './types';
import {
  getStoredWeeks,
  saveWeeks,
  getActiveWeekId,
  saveActiveWeekId,
  getStoredTheme,
  saveStoredTheme,
  getStoredSoundEnabled,
  saveStoredSoundEnabled,
  playCompletionSound,
  createNewWeekPlan,
  carryOverPendingTasks,
} from './utils/storage';
import { calculatePerformanceMetrics } from './utils/metrics';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WeeklyPlanView } from './components/WeeklyPlanView';
import { PerformanceView } from './components/PerformanceView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';

export default function App() {
  const [weeks, setWeeks] = useState<WeekPlan[]>(getStoredWeeks);
  const [activeWeekId, setActiveWeekId] = useState<string>(getActiveWeekId);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getStoredSoundEnabled);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalInitialDay, setModalInitialDay] = useState<DayOfWeek>('Monday');

  // AI Analysis Loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active Week Object
  const activeWeek = useMemo(() => {
    return weeks.find((w) => w.id === activeWeekId) || weeks[0];
  }, [weeks, activeWeekId]);

  // Derived Performance Metrics for Active Week (Recalculated instantly on any change)
  const activeMetrics = useMemo(() => {
    return calculatePerformanceMetrics(activeWeek);
  }, [activeWeek]);

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync sound preference
  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    saveStoredSoundEnabled(enabled);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectWeek = (id: string) => {
    setActiveWeekId(id);
    saveActiveWeekId(id);
  };

  // Toggle Task Status (☐ to ✓)
  const handleToggleTaskStatus = (taskId: string) => {
    const updatedTasks = activeWeek.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          playCompletionSound();
        }
        return {
          ...t,
          status: nextStatus,
          completedDate: nextStatus === 'completed' ? new Date().toISOString() : null,
        };
      }
      return t;
    });

    const updatedWeek: WeekPlan = {
      ...activeWeek,
      tasks: updatedTasks,
    };

    const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
  };

  // Add or Update Task
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdDate' | 'completedDate'> & { id?: string }
  ) => {
    let updatedTasks: Task[];

    if (taskData.id) {
      // Edit existing
      updatedTasks = activeWeek.tasks.map((t) => {
        if (t.id === taskData.id) {
          return {
            ...t,
            ...taskData,
          };
        }
        return t;
      });
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        weekId: activeWeek.id,
        date: taskData.date || activeWeek.startDate,
        day: taskData.day,
        subject: taskData.subject,
        goal: taskData.goal,
        taskName: taskData.taskName,
        priority: taskData.priority,
        status: 'pending',
        createdDate: new Date().toISOString(),
        completedDate: null,
        notes: taskData.notes,
      };
      updatedTasks = [...activeWeek.tasks, newTask];
    }

    const updatedWeek: WeekPlan = {
      ...activeWeek,
      tasks: updatedTasks,
    };

    const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
  };

  // Quick Add task from inline input
  const handleQuickAddTask = (day: DayOfWeek, taskName: string) => {
    const dayGoalObj = activeWeek.dayGoals[day] || {
      subject: 'General',
      goal: 'Weekly Milestone',
      priority: 'High',
    };

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      weekId: activeWeek.id,
      date: activeWeek.startDate,
      day,
      subject: dayGoalObj.subject || 'General',
      goal: dayGoalObj.goal || 'Weekly Goal',
      taskName,
      priority: dayGoalObj.priority || 'High',
      status: 'pending',
      createdDate: new Date().toISOString(),
      completedDate: null,
    };

    const updatedWeek: WeekPlan = {
      ...activeWeek,
      tasks: [...activeWeek.tasks, newTask],
    };

    const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = activeWeek.tasks.filter((t) => t.id !== taskId);
    const updatedWeek: WeekPlan = {
      ...activeWeek,
      tasks: updatedTasks,
    };
    const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
  };

  // Update Day Goal & Subject
  const handleUpdateDayGoal = (
    day: DayOfWeek,
    subject: string,
    goal: string,
    priority: Priority
  ) => {
    const updatedDayGoals = {
      ...activeWeek.dayGoals,
      [day]: {
        subject,
        goal,
        priority,
      },
    };

    const updatedWeek: WeekPlan = {
      ...activeWeek,
      dayGoals: updatedDayGoals,
    };

    const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
  };

  // Create New Week Plan
  const handleCreateNewWeek = () => {
    const { updatedWeeks, newWeek } = createNewWeekPlan(weeks);
    setWeeks(updatedWeeks);
    setActiveWeekId(newWeek.id);
  };

  // Carry Over tasks
  const handleCarryOverTasks = (sourceWeek: WeekPlan, targetWeekId: string) => {
    const updatedWeeks = carryOverPendingTasks(sourceWeek, targetWeekId, weeks);
    setWeeks(updatedWeeks);
  };

  // Open Modal Helpers
  const handleOpenNewTaskModal = (day?: DayOfWeek) => {
    setTaskToEdit(null);
    if (day) setModalInitialDay(day);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // AI Weekly Performance Analysis
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekData: activeWeek,
          metrics: activeMetrics,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await response.json();
      if (data.report) {
        const updatedWeek: WeekPlan = {
          ...activeWeek,
          aiAnalysis: {
            ...data.report,
            generatedAt: new Date().toISOString(),
            mode: data.mode || 'gemini',
          },
        };

        const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
        setWeeks(updatedWeeks);
        saveWeeks(updatedWeeks);
        // Switch to performance tab to view the generated report
        setActiveTab('performance');
      }
    } catch (e) {
      console.error('Error executing AI analysis:', e);
      // Generate immediate local metrics report fallback
      const updatedWeek: WeekPlan = {
        ...activeWeek,
        aiAnalysis: {
          overallScore: activeMetrics.overallScore,
          summary: `You completed ${activeMetrics.overallCompletion}% of your planned tasks this week (${activeMetrics.completedTasks}/${activeMetrics.totalTasks} tasks) with an overall score of ${activeMetrics.overallScore}/100.`,
          strengths: activeMetrics.strengths,
          whatNeedsImprovement: activeMetrics.areasToImprove,
          nextWeekRecommendations: activeMetrics.recommendations,
          generatedAt: new Date().toISOString(),
          mode: 'rule-based',
        },
      };
      const updatedWeeks = weeks.map((w) => (w.id === activeWeek.id ? updatedWeek : w));
      setWeeks(updatedWeeks);
      saveWeeks(updatedWeeks);
      setActiveTab('performance');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weeks={weeks}
        activeWeekId={activeWeekId}
        onSelectWeek={handleSelectWeek}
        onOpenNewTaskModal={() => handleOpenNewTaskModal('Monday')}
        metrics={activeMetrics}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            activeWeek={activeWeek}
            metrics={activeMetrics}
            onToggleTaskStatus={handleToggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onNavigateTab={setActiveTab}
            onRunAIAnalysis={handleRunAIAnalysis}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlanView
            activeWeek={activeWeek}
            onToggleTaskStatus={handleToggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onUpdateDayGoal={handleUpdateDayGoal}
            onQuickAddTask={handleQuickAddTask}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceView
            activeWeek={activeWeek}
            metrics={activeMetrics}
            onRunAIAnalysis={handleRunAIAnalysis}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            weeks={weeks}
            activeWeekId={activeWeekId}
            onSelectWeek={handleSelectWeek}
            onCreateNewWeek={handleCreateNewWeek}
            onCarryOverTasks={handleCarryOverTasks}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            weeks={weeks}
            onUpdateWeeks={setWeeks}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1F2937] py-6 bg-white/60 dark:bg-[#12151C]/90 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">WeekCraft</span>
            <span>•</span>
            <span>Weekly Planner & Performance Analysis</span>
          </div>
          <p>
            Real-time calculations • Zero fake data • AI powered by Google Gemini
          </p>
        </div>
      </footer>

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        activeWeek={activeWeek}
        initialDay={modalInitialDay}
      />
    </div>
  );
}
