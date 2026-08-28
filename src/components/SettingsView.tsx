import React, { useRef, useState } from 'react';
import { WeekPlan } from '../types';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { INITIAL_WEEKS } from '../data/initialData';
import { saveWeeks } from '../utils/storage';

interface SettingsViewProps {
  weeks: WeekPlan[];
  onUpdateWeeks: (weeks: WeekPlan[]) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  weeks,
  onUpdateWeeks,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [userProfile, setUserProfile] = useState<'student' | 'professional'>('student');

  const handleExportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(weeks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `weekly_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMsg('Planner data exported successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Failed to export data');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0) {
          saveWeeks(json);
          onUpdateWeeks(json);
          setSuccessMsg(`Successfully imported ${json.length} weeks of planner data!`);
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          setErrorMsg('Invalid backup file format.');
        }
      } catch {
        setErrorMsg('Error parsing backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all planner data back to sample weeks? Your current custom tasks will be replaced.')) {
      saveWeeks(INITIAL_WEEKS);
      onUpdateWeeks(INITIAL_WEEKS);
      setSuccessMsg('Reset planner data to default sample weeks.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1F2937] shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Application Settings & Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Planner Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your experience, manage local data backups, and configure notification chimes.
        </p>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* User Persona & Role Mode */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          User Role Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tailor task suggestions and priority heuristics to your daily workflow.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setUserProfile('student')}
            className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
              userProfile === 'student'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#161A24]'
            }`}
          >
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                🎓 Student Mode
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optimized for subjects, coursework, assignments, and exam prep.
              </p>
            </div>
            {userProfile === 'student' && <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>

          <button
            type="button"
            onClick={() => setUserProfile('professional')}
            className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
              userProfile === 'professional'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#161A24]'
            }`}
          >
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                💼 Working Professional Mode
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optimized for sprint goals, project deliverables, and meetings.
              </p>
            </div>
            {userProfile === 'professional' && <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Visual & Audio Preferences */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Appearance & Audio
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-[#1F2937]">
          {/* Theme */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Color Theme</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between high-contrast light and dark mode</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-bold bg-slate-100 dark:bg-[#161A24] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1F2937] hover:bg-slate-200 dark:hover:bg-[#1C2230] transition"
            >
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          {/* Sound Effect */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Task Completion Chime</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Play pleasant audio chime when clicking ✓ checkbox</p>
              </div>
            </div>
            <button
              onClick={() => onToggleSound(!soundEnabled)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                soundEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-[#161A24] text-slate-600 dark:text-slate-300 border border-transparent dark:border-[#1F2937]'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Data Storage & Backup (Requirement #9)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All weekly plans, tasks, goals, and metrics are saved locally in your browser so you never lose your progress on refresh.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            id="export-data-btn"
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161A24] hover:bg-slate-200 dark:hover:bg-[#1C2230] text-slate-800 dark:text-slate-100 border border-transparent dark:border-[#1F2937] text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            id="import-data-btn"
            onClick={handleImportClick}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161A24] hover:bg-slate-200 dark:hover:bg-[#1C2230] text-slate-800 dark:text-slate-100 border border-transparent dark:border-[#1F2937] text-xs font-bold transition"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Backup</span>
          </button>

          {/* Reset to Samples */}
          <button
            id="reset-data-btn"
            onClick={handleResetData}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Sample Weeks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
