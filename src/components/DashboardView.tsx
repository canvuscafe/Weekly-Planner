import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  NavTab,
  PerformanceMetrics,
  Task,
  WeekPlan,
} from '../types';
import { DailyTaskItem } from './DailyTaskItem';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Target,
  Flame,
  Clock,
  ListTodo,
} from 'lucide-react';

interface DashboardViewProps {
  activeWeek: WeekPlan;
  metrics: PerformanceMetrics;
  onToggleTaskStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: (day?: DayOfWeek) => void;
  onNavigateTab: (tab: NavTab) => void;
  onRunAIAnalysis: () => void;
  isAnalyzing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeWeek,
  metrics,
  onToggleTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onNavigateTab,
  onRunAIAnalysis,
  isAnalyzing,
}) => {
  // Determine current day of week (fallback to Monday if outside)
  const todayDayName = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayName || 'Monday');

  const todayTasks = activeWeek.tasks.filter((t) => t.day === selectedDay);
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;
  const todayPct = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
  const dayGoal = activeWeek.dayGoals[selectedDay];

  // High priority pending tasks across the whole week
  const highPriorityPending = activeWeek.tasks.filter(
    (t) => t.priority === 'High' && t.status === 'pending'
  );

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in">
      {/* Top Banner / Motivation Quote */}
      <div className="bg-gradient-to-r from-[#0e1322] via-[#161d31] to-[#0e1322] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/20 dark:border-[#1F2937] relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 dark:border-white/5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Weekly Focus • {activeWeek.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Focus on Progress, Master Your Craft.
            </h1>
            <p className="text-sm text-indigo-100/80 dark:text-slate-300 leading-relaxed">
              Track tasks, optimize daily study & work habits, and unlock actionable AI analysis calculated directly from your real data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-analyze-btn"
              onClick={onRunAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-indigo-600 text-indigo-900 dark:text-white font-bold text-sm shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-500 transition active:scale-95 disabled:opacity-75 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-indigo-600 dark:text-indigo-200 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Data...' : 'Analyze My Week'}</span>
            </button>
            <button
              id="dashboard-add-task-btn"
              onClick={() => onOpenNewTaskModal(selectedDay)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 dark:bg-[#161A24] dark:hover:bg-[#1C2230] text-white font-semibold text-sm border border-indigo-500/30 dark:border-[#1F2937] transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Performance Score */}
        <div
          id="metric-card-score"
          onClick={() => onNavigateTab('performance')}
          className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Performance Score
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metrics.performanceLevel.badgeColor}`}
            >
              {metrics.performanceLevel.label}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.overallScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${metrics.performanceLevel.bgColor}`}
              style={{ width: `${metrics.overallScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {metrics.performanceLevel.description}
          </p>
        </div>

        {/* Card 2: Overall Task Completion */}
        <div
          id="metric-card-completion"
          onClick={() => onNavigateTab('performance')}
          className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Completion
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.overallCompletion}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({metrics.completedTasks}/{metrics.totalTasks} done)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallCompletion}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {metrics.pendingTasks} tasks remaining this week
          </p>
        </div>

        {/* Card 3: High Priority Triage */}
        <div
          id="metric-card-high-priority"
          onClick={() => onNavigateTab('planner')}
          className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              High Priority Focus
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.highPriorityCompletedPct}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({metrics.highPriorityCompletedCount}/{metrics.highPriorityTotalCount} high)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.highPriorityCompletedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {metrics.highPriorityTotalCount - metrics.highPriorityCompletedCount} high priority pending
          </p>
        </div>

        {/* Card 4: Goals Completed */}
        <div
          id="metric-card-goals"
          onClick={() => onNavigateTab('performance')}
          className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Day Goals Achieved
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.goalsCompletedPct}%
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({metrics.goalsCompletedCount}/{metrics.goalsTotalCount} milestones)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.goalsCompletedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Consistency Rating: {metrics.consistencyScore}/100
          </p>
        </div>
      </div>

      {/* 7-Day Performance Ribbon */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Progress at a Glance
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('planner')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Open Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {metrics.dailyStats.map((d) => {
            const isSelected = d.day === selectedDay;
            return (
              <button
                key={d.day}
                id={`day-ribbon-btn-${d.day.toLowerCase()}`}
                onClick={() => setSelectedDay(d.day)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 dark:bg-[#161A24] border-slate-200/70 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#1C2230]'
                }`}
              >
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {d.day.slice(0, 3)}
                </span>
                <div className="my-2 flex flex-col items-center">
                  <span
                    className={`text-sm font-extrabold ${
                      d.pct >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : d.pct >= 50
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d.pct}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {d.completed}/{d.total}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1A1F2C] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      d.pct >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Today's Action Center & High Priority Action items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Day's Action Center */}
        <div className="lg:col-span-2 bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1F2937]">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDay}'s Focus
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/70">
                  {todayCompleted}/{todayTasks.length} Completed ({todayPct}%)
                </span>
              </div>
              {dayGoal && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {dayGoal.subject}:
                  </span>
                  <span>{dayGoal.goal}</span>
                </p>
              )}
            </div>

            <button
              id="today-add-task-btn"
              onClick={() => onOpenNewTaskModal(selectedDay)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to {selectedDay}</span>
            </button>
          </div>

          {/* Task List for Selected Day */}
          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-[#1F2937] rounded-xl dark:bg-[#0A0C10]/40">
                <ListTodo className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No tasks scheduled for {selectedDay}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Plan your goals and add actionable to-do items.
                </p>
                <button
                  onClick={() => onOpenNewTaskModal(selectedDay)}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-lg hover:bg-indigo-100 transition"
                >
                  + Add First Task
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <DailyTaskItem
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleTaskStatus}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Urgent Pending High Priority Tasks & Quick Insights */}
        <div className="space-y-6">
          {/* Urgent High Priority Tasks */}
          <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  High-Priority Pending
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                {highPriorityPending.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {highPriorityPending.length === 0 ? (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-center">
                  <span className="text-xl">🎉</span>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    All high-priority tasks completed!
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                    Great discipline and focus.
                  </p>
                </div>
              ) : (
                highPriorityPending.slice(0, 5).map((task) => (
                  <DailyTaskItem
                    key={task.id}
                    task={task}
                    compact
                    onToggleStatus={onToggleTaskStatus}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quick AI Tip / Strength Snippet */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#12151C] dark:to-[#161A24] rounded-2xl p-5 border border-indigo-100 dark:border-[#1F2937] shadow-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Automated Recommendation
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {metrics.recommendations[0] ||
                'Try completing high-priority tasks earlier in the day during your peak focus window.'}
            </p>
            <button
              onClick={() => onNavigateTab('performance')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1 pt-1"
            >
              <span>View full performance analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
