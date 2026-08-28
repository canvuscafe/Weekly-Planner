import React from 'react';
import { NavTab, WeekPlan, PerformanceMetrics } from '../types';
import {
  CalendarDays,
  CheckCircle2,
  History,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  weeks: WeekPlan[];
  activeWeekId: string;
  onSelectWeek: (id: string) => void;
  onOpenNewTaskModal: () => void;
  metrics: PerformanceMetrics;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  weeks,
  activeWeekId,
  onSelectWeek,
  onOpenNewTaskModal,
  metrics,
  theme,
  onToggleTheme,
}) => {
  const activeWeek = weeks.find((w) => w.id === activeWeekId) || weeks[0];

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'planner',
      label: 'Weekly Plan',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-white/90 dark:bg-[#12151C]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1F2937] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  WeekCraft
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
                  AI Planner
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Planner & Performance Analysis
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav
            id="desktop-navigation"
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-[#0A0C10] p-1 rounded-xl border border-slate-200/60 dark:border-[#1F2937]"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#161A24] text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#161A24]/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Week Selector, Score Pill, Add Task, Theme */}
          <div className="flex items-center space-x-2.5">
            {/* Week Selector Dropdown */}
            <div className="relative">
              <select
                id="header-week-select"
                value={activeWeekId}
                onChange={(e) => onSelectWeek(e.target.value)}
                className="text-xs font-semibold bg-slate-100 dark:bg-[#161A24] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1F2937] rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
              >
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Performance Score Badge */}
            <button
              id="header-score-badge"
              onClick={() => setActiveTab('performance')}
              title="Click to view full performance analysis"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Score:</span>
              <span className={`font-bold ${metrics.performanceLevel.textColor}`}>
                {metrics.overallScore}/100
              </span>
            </button>

            {/* Quick Add Task Button */}
            <button
              id="header-add-task-btn"
              onClick={onOpenNewTaskModal}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Task</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#161A24] transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-[#1F2937]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.icon}
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
