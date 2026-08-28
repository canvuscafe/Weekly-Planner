import React, { useState } from 'react';
import { WeekPlan, WeekHistoryItem } from '../types';
import { calculatePerformanceMetrics } from '../utils/metrics';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface HistoryViewProps {
  weeks: WeekPlan[];
  activeWeekId: string;
  onSelectWeek: (id: string) => void;
  onCreateNewWeek: () => void;
  onCarryOverTasks: (sourceWeek: WeekPlan, targetWeekId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  weeks,
  activeWeekId,
  onSelectWeek,
  onCreateNewWeek,
  onCarryOverTasks,
}) => {
  const [selectedForCarryover, setSelectedForCarryover] = useState<string | null>(null);

  // Compute metrics for every stored week
  const weekSummaries: WeekHistoryItem[] = weeks.map((w, idx) => {
    const m = calculatePerformanceMetrics(w);
    let trend: 'improving' | 'decreasing' | 'stable' = 'stable';
    if (idx > 0) {
      const prevM = calculatePerformanceMetrics(weeks[idx - 1]);
      if (m.overallScore > prevM.overallScore + 2) trend = 'improving';
      else if (m.overallScore < prevM.overallScore - 2) trend = 'decreasing';
    }

    return {
      id: w.id,
      name: w.name,
      startDate: w.startDate,
      endDate: w.endDate,
      completion: m.overallCompletion,
      score: m.overallScore,
      totalTasks: m.totalTasks,
      completedTasks: m.completedTasks,
      highPriorityPct: m.highPriorityCompletedPct,
      trend,
      isCurrent: w.id === activeWeekId,
    };
  });

  return (
    <div id="history-view" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1F2937] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Weekly Performance History & Trends</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Week-over-Week Progression
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Compare completion rates, scores, and discipline across multiple weekly cycles.
          </p>
        </div>

        <button
          id="history-create-week-btn"
          onClick={onCreateNewWeek}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Week Plan</span>
        </button>
      </div>

      {/* Week Selector Chips (Week 1 | Week 2 | Week 3 | Week 4) */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Select Active Planner Week
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {weeks.map((w, index) => {
            const isSelected = w.id === activeWeekId;
            const item = weekSummaries.find((s) => s.id === w.id);
            return (
              <button
                key={w.id}
                id={`week-select-chip-${w.id}`}
                onClick={() => onSelectWeek(w.id)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#161A24] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#1C2230]'
                }`}
              >
                <span>Week {index + 1}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item ? `${item.score}/100` : 'Active'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Historical Performance Table Requirement (#7) */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-[#1F2937] flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Weekly Performance Comparison Table
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{weeks.length} Total Weeks Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A0C10]/60 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-5">Week Name</th>
                <th className="py-3.5 px-4 text-center">Completion Rate</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Tasks Completed</th>
                <th className="py-3.5 px-4 text-center">High Priority %</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2937] font-medium">
              {weekSummaries.map((w) => {
                return (
                  <tr
                    key={w.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-[#161A24]/60 transition ${
                      w.isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {w.name}
                        </span>
                        {w.isCurrent && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {w.startDate} → {w.endDate}
                      </span>
                    </td>

                    {/* Completion */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {w.completion}%
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          w.score >= 90
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : w.score >= 75
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : w.score >= 60
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {w.score} / 100
                      </span>
                    </td>

                    {/* Tasks Completed */}
                    <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300">
                      <span className="font-bold">{w.completedTasks}</span> / {w.totalTasks}
                    </td>

                    {/* High Priority % */}
                    <td className="py-4 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                      {w.highPriorityPct}%
                    </td>

                    {/* Trend Indicator (#7 Requirement) */}
                    <td className="py-4 px-4 text-center">
                      {w.trend === 'improving' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>📈 Improving</span>
                        </span>
                      ) : w.trend === 'decreasing' ? (
                        <span className="inline-flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>📉 Decreasing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-500 font-semibold bg-slate-100 dark:bg-[#161A24] px-2 py-0.5 rounded-md">
                          <Minus className="w-3.5 h-3.5" />
                          <span>➡️ Stable</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        id={`history-switch-btn-${w.id}`}
                        onClick={() => onSelectWeek(w.id)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition"
                      >
                        <span>Open Week</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Week Trend Visualizer */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Historical Score Progression Chart
        </h3>

        <div className="h-44 flex items-end justify-between pt-6 px-4 border-b border-slate-100 dark:border-[#1F2937]">
          {weekSummaries.map((w, idx) => (
            <div key={w.id} className="flex-1 flex flex-col items-center justify-end h-full px-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {w.score}
              </span>
              <div className="w-full max-w-[48px] bg-slate-100 dark:bg-[#161A24] rounded-t-xl h-28 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-xl transition-all duration-700"
                  style={{ height: `${w.score}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 truncate max-w-[80px]">
                W{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
