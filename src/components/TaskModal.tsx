import React, { useState, useEffect } from 'react';
import { DayOfWeek, DAYS_OF_WEEK, Priority, Task, WeekPlan } from '../types';
import { X, Calendar, BookOpen, Target, AlertCircle, FileText } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdDate' | 'completedDate'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  activeWeek: WeekPlan;
  initialDay?: DayOfWeek;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  activeWeek,
  initialDay = 'Monday',
}) => {
  const [taskName, setTaskName] = useState('');
  const [day, setDay] = useState<DayOfWeek>(initialDay);
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Pre-fill form when editing or opening with day
  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.taskName);
      setDay(taskToEdit.day);
      setSubject(taskToEdit.subject);
      setGoal(taskToEdit.goal);
      setPriority(taskToEdit.priority);
      setDate(taskToEdit.date);
      setNotes(taskToEdit.notes || '');
    } else {
      const selectedDay = initialDay || 'Monday';
      setDay(selectedDay);
      const defaultGoalObj = activeWeek.dayGoals[selectedDay];
      setSubject(defaultGoalObj?.subject || 'Java OOP');
      setGoal(defaultGoalObj?.goal || 'Complete Java OOP concepts');
      setPriority(defaultGoalObj?.priority || 'High');
      setTaskName('');
      setDate(activeWeek.startDate || new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [taskToEdit, initialDay, activeWeek, isOpen]);

  // When day changes and user hasn't typed custom subject/goal, auto-suggest from that day's goal
  const handleDayChange = (newDay: DayOfWeek) => {
    setDay(newDay);
    if (!taskToEdit) {
      const dayGoal = activeWeek.dayGoals[newDay];
      if (dayGoal) {
        setSubject(dayGoal.subject);
        setGoal(dayGoal.goal);
        setPriority(dayGoal.priority);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Please enter a task name.');
      return;
    }
    if (!subject.trim()) {
      setError('Please specify a subject.');
      return;
    }

    onSave({
      id: taskToEdit?.id,
      weekId: activeWeek.id,
      day,
      date: date || activeWeek.startDate,
      subject: subject.trim(),
      goal: goal.trim() || `Master ${subject.trim()}`,
      taskName: taskName.trim(),
      priority,
      status: taskToEdit ? taskToEdit.status : 'pending',
      notes: notes.trim() ? notes.trim() : undefined,
    });

    onClose();
  };

  return (
    <div
      id="task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="task-modal-content"
        className="bg-white dark:bg-[#12151C] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1F2937] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#0A0C10]/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {taskToEdit ? 'Edit Task' : 'Add New Task'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeWeek.name}
            </p>
          </div>
          <button
            id="close-task-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#161A24] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-name-input"
              type="text"
              required
              autoFocus
              placeholder="e.g. Learn Encapsulation, Practice Inheritance..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Day & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Day of Week</span>
              </label>
              <select
                id="task-day-select"
                value={day}
                onChange={(e) => handleDayChange(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      id={`priority-btn-${p.toLowerCase()}`}
                      onClick={() => setPriority(p)}
                      className={`px-2 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1 ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                            : p === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#161A24] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#1C2230]'
                      }`}
                    >
                      <span>
                        {p === 'High' ? '🔴' : p === 'Medium' ? '🟡' : '🟢'}
                      </span>
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Subject <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="task-subject-input"
              type="text"
              required
              placeholder="e.g. Java, Data Structures, SQL, System Design..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Work / Study Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Work / Study Goal</span>
            </label>
            <input
              id="task-goal-input"
              type="text"
              placeholder="e.g. Complete Java OOP concepts"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Notes (Optional)</span>
            </label>
            <textarea
              id="task-notes-input"
              rows={2}
              placeholder="Key references, problem links, or study notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#161A24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-[#1F2937]">
            <button
              type="button"
              id="cancel-task-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#161A24] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-task-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition active:scale-95"
            >
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
