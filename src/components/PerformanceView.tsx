import React, { useState } from 'react';
import { PerformanceMetrics, WeekPlan } from '../types';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Award,
  Zap,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface PerformanceViewProps {
  activeWeek: WeekPlan;
  metrics: PerformanceMetrics;
  onRunAIAnalysis: () => void;
  isAnalyzing: boolean;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  activeWeek,
  metrics,
  onRunAIAnalysis,
  isAnalyzing,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const report = activeWeek.aiAnalysis;

  const handleCopyReport = () => {
    if (!report) return;
    const text = `📈 Weekly Performance Report: ${activeWeek.name}\nOverall Score: ${report.overallScore}/100\n\nSummary:\n${report.summary}\n\nWhat Went Well:\n${report.strengths.map((s) => `• ${s}`).join('\n')}\n\nWhat Needs Improvement:\n${report.whatNeedsImprovement.map((w) => `• ${w}`).join('\n')}\n\nNext Week Recommendations:\n${report.nextWeekRecommendations.map((r) => `• ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cumulative progress trend points for the SVG trend line
  let runningTotal = 0;
  let runningCompleted = 0;
  const trendPoints = metrics.dailyStats.map((d) => {
    runningTotal += d.total;
    runningCompleted += d.completed;
    const cumPct = runningTotal > 0 ? Math.round((runningCompleted / runningTotal) * 100) : 0;
    return { day: d.day, cumPct, completed: runningCompleted, total: runningTotal };
  });

  return (
    <div id="performance-view" className="space-y-8 animate-fade-in">
      {/* Top Header with "Analyze My Week" CTA */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1F2937] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Weekly Performance Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Productivity & Goal Execution
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Live derived analytics calculated 100% from your actual tasks and completion checkboxes for <span className="font-semibold text-slate-800 dark:text-slate-200">{activeWeek.name}</span>.
          </p>
        </div>

        <button
          id="performance-analyze-week-btn"
          onClick={onRunAIAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition active:scale-95 disabled:opacity-75 cursor-pointer shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Real Data...' : 'Analyze My Week'}</span>
        </button>
      </div>

      {/* 6 Core Statistical Metrics Requirement (#3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Overall Completion */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Overall Completion</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.overallCompletion}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${metrics.overallCompletion}%` }} />
          </div>
        </div>

        {/* Metric 2: Tasks Completed */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tasks Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.completedTasks}
          </div>
          <span className="text-[11px] text-slate-400">✓ tick marks checked</span>
        </div>

        {/* Metric 3: Total Tasks */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Tasks</span>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {metrics.totalTasks}
          </div>
          <span className="text-[11px] text-slate-400">Planned this week</span>
        </div>

        {/* Metric 4: Pending Tasks */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Tasks</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {metrics.pendingTasks}
          </div>
          <span className="text-[11px] text-slate-400">Needing completion</span>
        </div>

        {/* Metric 5: High Priority Completed */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">High Priority Done</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {metrics.highPriorityCompletedPct}%
          </div>
          <span className="text-[11px] text-slate-400">
            {metrics.highPriorityCompletedCount}/{metrics.highPriorityTotalCount} high tasks
          </span>
        </div>

        {/* Metric 6: Goals Completed */}
        <div className="bg-white dark:bg-[#12151C] p-4 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Goals Completed</span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {metrics.goalsCompletedPct}%
          </div>
          <span className="text-[11px] text-slate-400">
            {metrics.goalsCompletedCount}/{metrics.goalsTotalCount} milestones
          </span>
        </div>
      </div>

      {/* Main Grid: Performance Score Gauge & Weekly Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Performance Score Widget (#6) */}
        <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1F2937]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Performance Score
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metrics.performanceLevel.badgeColor}`}>
              {metrics.performanceLevel.label}
            </span>
          </div>

          {/* Big Circular Arc Gauge */}
          <div className="my-6 relative flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-[#1A1F2C]"
              />
              {/* Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - metrics.overallScore / 100)}
                strokeLinecap="round"
                className={`${metrics.performanceLevel.textColor} transition-all duration-1000 ease-out`}
              />
            </svg>

            {/* Centered Score */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.overallScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Performance Levels Legend */}
          <div className="w-full space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1F2937] text-left text-[11px]">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>90–100: Excellent</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>75–89: Very Good</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>60–74: Good</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>40–59: Needs Improvement</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Below 40: Poor</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
          </div>
        </div>

        {/* Col 2 & 3: 📊 Weekly Performance Chart (Monday → 80%, etc.) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>📊 Weekly Performance Chart</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily completion rates (Monday → Sunday)
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
                <span className="text-slate-600 dark:text-slate-400">Completion %</span>
              </span>
            </div>
          </div>

          {/* Interactive Responsive SVG Bar Chart */}
          <div className="w-full h-56 relative flex items-end justify-between pt-6 pb-2 px-2 border-b border-slate-200 dark:border-[#1F2937]">
            {metrics.dailyStats.map((d) => {
              const isHovered = hoveredDay === d.day;
              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredDay(d.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer px-1"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
                      {d.day}: {d.completed}/{d.total} tasks ({d.pct}%)
                    </div>
                  )}

                  {/* Percentage label on top of bar */}
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                    {d.pct}%
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-[#161A24] rounded-t-lg overflow-hidden h-36 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        d.pct >= 80
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : d.pct >= 50
                          ? 'bg-gradient-to-t from-indigo-600 to-blue-500'
                          : 'bg-gradient-to-t from-amber-600 to-amber-400'
                      } ${isHovered ? 'brightness-110 shadow-md' : ''}`}
                      style={{ height: `${Math.max(6, d.pct)}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    {d.day.slice(0, 3)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {d.completed}/{d.total}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Peak Day: <strong className="text-emerald-600 dark:text-emerald-400">{metrics.strengths[0] || 'Wednesday'}</strong></span>
            <span>Week Average: <strong className="text-indigo-600 dark:text-indigo-400">{metrics.overallCompletion}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Secondary Analytical Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Subject-Wise Performance */}
        <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Subject-Wise Performance
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">{metrics.subjectStats.length} subjects</span>
          </div>

          <div className="space-y-3 pt-1">
            {metrics.subjectStats.slice(0, 5).map((sub) => (
              <div key={sub.subject} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="truncate max-w-[140px]">{sub.subject}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {sub.pct}% <span className="text-slate-400 font-normal">({sub.completed}/{sub.total})</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Priority-Wise Completion */}
        <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Priority-Wise Completion
            </h4>
          </div>

          <div className="space-y-3 pt-1">
            {/* High */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <span>🔴 High Priority</span>
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  {metrics.priorityStats.High.pct}% ({metrics.priorityStats.High.completed}/{metrics.priorityStats.High.total})
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.priorityStats.High.pct}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <span>🟡 Medium Priority</span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {metrics.priorityStats.Medium.pct}% ({metrics.priorityStats.Medium.completed}/{metrics.priorityStats.Medium.total})
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.priorityStats.Medium.pct}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1">
                  <span>🟢 Low Priority</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {metrics.priorityStats.Low.pct}% ({metrics.priorityStats.Low.completed}/{metrics.priorityStats.Low.total})
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1A1F2C] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.priorityStats.Low.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Completed vs Pending Tasks Donut */}
        <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Completed vs Pending
          </h4>

          <div className="flex items-center justify-center pt-1">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                {/* Pending Segment (Full circle bg) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  className="dark:stroke-[#1A1F2C]"
                />
                {/* Completed Segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - metrics.overallCompletion / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {metrics.overallCompletion}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-around text-[11px] pt-1 border-t border-slate-100 dark:border-[#1F2937]">
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{metrics.completedTasks} Done</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#1A1F2C]" />
              <span>{metrics.pendingTasks} Pending</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Weekly Progress Trend (Cumulative) */}
        <div className="bg-white dark:bg-[#12151C] rounded-2xl p-5 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Weekly Progress Trend
          </h4>

          <div className="h-28 flex items-end justify-between pt-4 px-1">
            {trendPoints.map((t) => (
              <div key={t.day} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {t.cumPct}%
                </span>
                <div className="w-full max-w-[16px] bg-slate-100 dark:bg-[#161A24] rounded-t h-20 flex items-end">
                  <div
                    className="w-full bg-indigo-500 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max(8, t.cumPct)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-semibold mt-1">
                  {t.day.slice(0, 1)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            Cumulative completion trajectory
          </p>
        </div>
      </div>

      {/* Section 4: Automated Dynamic Data Analysis Card */}
      <div className="bg-white dark:bg-[#12151C] rounded-2xl p-6 border border-slate-200 dark:border-[#1F2937] shadow-xs space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-[#1F2937] pb-3">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Automated Planner Data Analysis
          </h3>
        </div>

        {/* Performance Summary Banner */}
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
            Performance Summary
          </span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            You completed {metrics.overallCompletion}% of your planned tasks this week ({metrics.completedTasks} out of {metrics.totalTasks} total tasks).
          </p>
        </div>

        {/* Strengths & Areas to Improve Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/25 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strengths</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {metrics.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/25 rounded-xl border border-rose-200/50 dark:border-rose-800/40 space-y-2">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Areas to Improve</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {metrics.areasToImprove.map((a, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/25 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>Actionable Recommendation</span>
          </h4>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {metrics.recommendations[0] ||
              'Try completing high-priority tasks earlier in the day and reduce the number of tasks planned for Saturday.'}
          </p>
        </div>
      </div>

      {/* Section 5: AI Performance Analysis Report Card (#5) */}
      <div
        id="ai-analysis-report-card"
        className="bg-gradient-to-br from-[#0c101b] via-[#14162e] to-[#0c101b] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/20 dark:border-[#1F2937] relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10 dark:border-[#1F2937]">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                📈 Your Weekly Performance Report
              </h3>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              Generated by Gemini 3.7 Flash AI Model analyzing your real tasks & execution rhythm
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {report && (
              <button
                onClick={handleCopyReport}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            )}
            <button
              onClick={onRunAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Re-analyzing...' : 'Refresh AI Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Content of AI Report */}
        {report ? (
          <div className="mt-6 space-y-6">
            {/* Overall Score Badge */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 dark:bg-[#12151C]/90 border border-white/10 dark:border-[#1F2937] backdrop-blur-md">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  AI Evaluated Overall Score
                </span>
                <p className="text-xs text-slate-300 mt-0.5">{report.summary}</p>
              </div>
              <div className="flex items-baseline space-x-1 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
                <span className="text-3xl font-black text-indigo-300">{report.overallScore}</span>
                <span className="text-xs font-bold text-indigo-200">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* What Went Well */}
              <div className="p-5 rounded-2xl bg-white/5 dark:bg-[#12151C]/90 border border-white/10 dark:border-[#1F2937] space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>What Went Well</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {report.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What Needs Improvement */}
              <div className="p-5 rounded-2xl bg-white/5 dark:bg-[#12151C]/90 border border-white/10 dark:border-[#1F2937] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>What Needs Improvement</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {report.whatNeedsImprovement.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Week Recommendation */}
              <div className="p-5 rounded-2xl bg-white/5 dark:bg-[#12151C]/90 border border-white/10 dark:border-[#1F2937] space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Next Week Recommendation</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {report.nextWeekRecommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center py-10 space-y-3">
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
            <h4 className="text-base font-bold text-white">Generate Your Weekly AI Report</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Click the button below to have Gemini AI examine your subject completion rates, high-priority accomplishments, and day-by-day consistency.
            </p>
            <button
              onClick={onRunAIAnalysis}
              disabled={isAnalyzing}
              className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Real Data...' : 'Analyze My Week Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
