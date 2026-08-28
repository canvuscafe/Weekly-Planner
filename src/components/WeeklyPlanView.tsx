import React, { useState } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  Priority,
  Task,
  WeekPlan,
} from '../types';
import { DailyTaskItem } from './DailyTaskItem';
import {
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  LayoutGrid,
  Square,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface WeeklyPlanViewProps {
  activeWeek: WeekPlan;
  onToggleTaskStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: (day?: DayOfWeek) => void;
  onUpdateDayGoal: (day: DayOfWeek, subject: string, goal: string, priority: Priority) => void;
  onQuickAddTask: (day: DayOfWeek, taskName: string) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  activeWeek,
  onToggleTaskStatus,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onUpdateDayGoal,
  onQuickAddTask,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'tabs'>('grid');
  const [activeTabDay, setActiveTabDay] = useState<DayOfWeek>('Monday');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Priority>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [quickInputDay, setQuickInputDay] = useState<DayOfWeek | null>(null);
  const [quickTaskText, setQuickTaskText] = useState<string>('');

  // Editing day goal modal/inline state
  const [editingDayGoal, setEditingDayGoal] = useState<DayOfWeek | null>(null);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editGoal, setEditGoal] = useState<string>('');
  const [editPriority, setEditPriority] = useState<Priority>('High');

  // Extract all unique subjects in this week
  const allSubjects = Array.from(
    new Set(activeWeek.tasks.map((t) => t.subject).filter(Boolean))
  );

  const startEditDayGoal = (day: DayOfWeek) => {
    const current = activeWeek.dayGoals[day];
    setEditingDayGoal(day);
    setEditSubject(current?.subject || 'Java');
    setEditGoal(current?.goal || 'Complete Java OOP concepts');
    setEditPriority(current?.priority || 'High');
  };

  const saveDayGoal = (day: DayOfWeek) => {
    onUpdateDayGoal(day, editSubject, editGoal, editPriority);
    setEditingDayGoal(null);
  };

  const handleQuickSubmit = (day: DayOfWeek) => {
    if (!quickTaskText.trim()) return;
    onQuickAddTask(day, quickTaskText.trim());
    setQuickTaskText('');
    setQuickInputDay(null);
  };

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((t) => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (selectedSubject !== 'ALL' && t.subject !== selectedSubject) return false;
      return true;
    });
  };

  return (
    <div id="weekly-plan-view" className="space-y-6 animate-fade-in">
      {/* Control Bar: Filters & View Switcher */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#0A0C10] p-1 rounded-xl border border-slate-200 dark:border-[#1F2937]">
            {(['ALL', 'High', 'Medium', 'Low'] as Array<'ALL' | Priority>).map((p) => (
              <button
                key={p}
                id={`filter-priority-${p.toLowerCase()}`}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  priorityFilter === p
                    ? 'bg-white dark:bg-[#161A24] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p === 'High' ? '🔴 High' : p === 'Medium' ? '🟡 Med' : p === 'Low' ? '🟢 Low' : 'All'}
              </button>
            ))}
          </div>

          {/* Subject filter */}
          {allSubjects.length > 0 && (
            <select
              id="filter-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-bold bg-slate-100 dark:bg-[#0A0C10] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1F2937] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects ({allSubjects.length})</option>
              {allSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: View switcher & Add task button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#0A0C10] p-1 rounded-xl border border-slate-200 dark:border-[#1F2937]">
            <button
              id="view-mode-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#161A24] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">7-Day Grid</span>
            </button>
            <button
              id="view-mode-tabs-btn"
              onClick={() => setViewMode('tabs')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'tabs'
                  ? 'bg-white dark:bg-[#161A24] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Day Tab</span>
            </button>
          </div>

          <button
            id="planner-add-task-btn"
            onClick={() => onOpenNewTaskModal(activeTabDay)}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation if viewMode is 'tabs' */}
      {viewMode === 'tabs' && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const dayTasks = activeWeek.tasks.filter((t) => t.day === day);
            const comp = dayTasks.filter((t) => t.status === 'completed').length;
            const isCurrentTab = activeTabDay === day;
            return (
              <button
                key={day}
                id={`day-tab-btn-${day.toLowerCase()}`}
                onClick={() => setActiveTabDay(day)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition ${
                  isCurrentTab
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-[#12151C] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#161A24]'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isCurrentTab
                      ? 'bg-indigo-700/80 text-white'
                      : 'bg-slate-100 dark:bg-[#1A1F2C] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {comp}/{dayTasks.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 7-Day Kanban/Grid Layout */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'space-y-4'
        }
      >
        {DAYS_OF_WEEK.filter((d) => (viewMode === 'tabs' ? d === activeTabDay : true)).map(
          (day) => {
            const dayGoalObj = activeWeek.dayGoals[day] || {
              subject: 'Java',
              goal: 'Complete Java OOP concepts',
              priority: 'High',
            };
            const allDayTasks = activeWeek.tasks.filter((t) => t.day === day);
            const visibleDayTasks = filterTasks(allDayTasks);
            const completedCount = allDayTasks.filter((t) => t.status === 'completed').length;
            const dayPct =
              allDayTasks.length > 0
                ? Math.round((completedCount / allDayTasks.length) * 100)
                : 0;

            const isEditingGoal = editingDayGoal === day;

            return (
              <div
                key={day}
                id={`day-column-${day.toLowerCase()}`}
                className="bg-white dark:bg-[#12151C] rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Day Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1F2937] bg-slate-50/70 dark:bg-[#161A24]/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {day}
                      </h3>
                    </div>

                    {/* Completion Ring / Badge */}
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          dayPct === 100
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : dayPct > 0
                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-100 dark:bg-[#1A1F2C] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {completedCount}/{allDayTasks.length} ({dayPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Day Goal & Subject Card / Editor */}
                  {isEditingGoal ? (
                    <div className="p-3 bg-white dark:bg-[#0A0C10] rounded-xl border border-indigo-300 dark:border-indigo-600 space-y-2 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded font-semibold text-slate-900 dark:text-white"
                          placeholder="e.g. Java"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Work / Study Goal
                        </label>
                        <input
                          type="text"
                          value={editGoal}
                          onChange={(e) => setEditGoal(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded font-semibold text-slate-900 dark:text-white"
                          placeholder="e.g. Complete Java OOP concepts"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex space-x-1">
                          {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setEditPriority(p)}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                editPriority === p
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-[#161A24] text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingDayGoal(null)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => saveDayGoal(day)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group/goal relative mt-2 p-2.5 rounded-xl bg-white dark:bg-[#0A0C10]/80 border border-slate-200/70 dark:border-[#1F2937]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/60">
                          {dayGoalObj.subject}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161A24] text-slate-600 dark:text-slate-400">
                            {dayGoalObj.priority === 'High'
                              ? '🔴 High'
                              : dayGoalObj.priority === 'Medium'
                              ? '🟡 Med'
                              : '🟢 Low'}
                          </span>
                          <button
                            onClick={() => startEditDayGoal(day)}
                            title="Edit day goal & subject"
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded opacity-0 group-hover/goal:opacity-100 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                        {dayGoalObj.goal}
                      </p>
                    </div>
                  )}

                  {/* Visual Day Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-[#1A1F2C] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dayPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${dayPct}%` }}
                    />
                  </div>
                </div>

                {/* To-Do List of Tasks */}
                <div className="p-4 sm:p-5 flex-1 space-y-2.5 overflow-y-auto max-h-[420px]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>TO-DO LIST</span>
                    <span>{visibleDayTasks.length} tasks</span>
                  </div>

                  {visibleDayTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-[#1F2937] rounded-xl dark:bg-[#0A0C10]/30">
                      <Square className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs font-medium">No tasks found</p>
                      <button
                        onClick={() => onOpenNewTaskModal(day)}
                        className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Add task
                      </button>
                    </div>
                  ) : (
                    visibleDayTasks.map((task) => (
                      <DailyTaskItem
                        key={task.id}
                        task={task}
                        onToggleStatus={onToggleTaskStatus}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))
                  )}

                  {/* Inline Quick Add Input */}
                  {quickInputDay === day ? (
                    <div className="pt-2">
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Type task & press enter..."
                          value={quickTaskText}
                          onChange={(e) => setQuickTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickSubmit(day);
                            if (e.key === 'Escape') setQuickInputDay(null);
                          }}
                          className="flex-1 text-xs px-3 py-1.5 bg-slate-50 dark:bg-[#0A0C10] border border-indigo-400 dark:border-indigo-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuickSubmit(day)}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setQuickInputDay(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Footer: Quick Add Button */}
                <div className="p-3 border-t border-slate-100 dark:border-[#1F2937] bg-slate-50/50 dark:bg-[#161A24]/40 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setQuickInputDay(day);
                      setQuickTaskText('');
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add</span>
                  </button>

                  <button
                    onClick={() => onOpenNewTaskModal(day)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Full Details ↗
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
