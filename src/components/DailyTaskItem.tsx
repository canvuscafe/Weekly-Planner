import React from 'react';
import { Task } from '../types';
import { Check, Trash2, Edit3, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyTaskItemProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

export const DailyTaskItem: React.FC<DailyTaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const isCompleted = task.status === 'completed';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    }
    onToggleStatus(task.id);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'High':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/70';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/70';
      case 'Low':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/70';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-[#161A24] dark:border-[#1F2937] dark:text-slate-300';
    }
  };

  return (
    <div
      id={`task-item-${task.id}`}
      className={`group relative flex items-start justify-between p-3 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-[#0A0C10]/60 border-slate-200/70 dark:border-[#1F2937]/70 opacity-80'
          : 'bg-white dark:bg-[#161A24] border-slate-200 dark:border-[#1F2937] shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        {/* Custom Interactive Checkbox: ☐ to ✓ */}
        <button
          type="button"
          id={`task-check-btn-${task.id}`}
          onClick={handleToggle}
          aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs scale-105'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0A0C10] hover:border-indigo-500 text-transparent'
          }`}
        >
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : (
            <span className="text-[10px] text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100">
              ✓
            </span>
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            {/* Subject Badge */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 tracking-tight">
              {task.subject}
            </span>

            {/* Priority Badge */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center space-x-1 ${getPriorityColor()}`}
            >
              <span>{task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'}</span>
              <span>{task.priority}</span>
            </span>

            {/* Compact Day badge if rendered on dashboard */}
            {compact && (
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1A1F2C] px-1.5 py-0.5 rounded border border-transparent dark:border-[#1F2937]">
                {task.day}
              </span>
            )}
          </div>

          {/* Task Name with Strike-Through on completion */}
          <p
            className={`text-sm font-medium leading-snug transition-all break-words ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {task.taskName}
          </p>

          {/* Goal & Notes */}
          {!compact && (
            <div className="mt-1 flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              {task.goal && (
                <span className="truncate max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
                  🎯 {task.goal}
                </span>
              )}
              {task.notes && (
                <span
                  title={task.notes}
                  className="flex items-center space-x-1 text-[11px] text-indigo-600 dark:text-indigo-400 cursor-help"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{task.notes}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Edit, Delete) */}
      <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
        <button
          type="button"
          id={`edit-task-btn-${task.id}`}
          onClick={() => onEdit(task)}
          title="Edit task"
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-[#1C2230] dark:hover:text-indigo-400 transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          id={`delete-task-btn-${task.id}`}
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
