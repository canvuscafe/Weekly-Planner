import {
  DayOfWeek,
  DAYS_OF_WEEK,
  Task,
  WeekPlan,
  PerformanceMetrics,
  DailyStat,
  SubjectStat,
  PriorityBreakdown,
} from '../types';

export function calculatePerformanceMetrics(
  weekPlan: WeekPlan
): PerformanceMetrics {
  const tasks = weekPlan.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // High priority metrics
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High');
  const highPriorityTotalCount = highPriorityTasks.length;
  const highPriorityCompletedCount = highPriorityTasks.filter((t) => t.status === 'completed').length;
  const highPriorityCompletedPct =
    highPriorityTotalCount > 0
      ? Math.round((highPriorityCompletedCount / highPriorityTotalCount) * 100)
      : 0;

  // Medium priority metrics
  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'Medium');
  const mediumPriorityTotalCount = mediumPriorityTasks.length;
  const mediumPriorityCompletedCount = mediumPriorityTasks.filter((t) => t.status === 'completed').length;
  const mediumPriorityCompletedPct =
    mediumPriorityTotalCount > 0
      ? Math.round((mediumPriorityCompletedCount / mediumPriorityTotalCount) * 100)
      : 0;

  // Low priority metrics
  const lowPriorityTasks = tasks.filter((t) => t.priority === 'Low');
  const lowPriorityTotalCount = lowPriorityTasks.length;
  const lowPriorityCompletedCount = lowPriorityTasks.filter((t) => t.status === 'completed').length;
  const lowPriorityCompletedPct =
    lowPriorityTotalCount > 0
      ? Math.round((lowPriorityCompletedCount / lowPriorityTotalCount) * 100)
      : 0;

  // Priority Breakdown object
  const priorityStats = {
    High: {
      total: highPriorityTotalCount,
      completed: highPriorityCompletedCount,
      pending: highPriorityTotalCount - highPriorityCompletedCount,
      pct: highPriorityCompletedPct,
    },
    Medium: {
      total: mediumPriorityTotalCount,
      completed: mediumPriorityCompletedCount,
      pending: mediumPriorityTotalCount - mediumPriorityCompletedCount,
      pct: mediumPriorityCompletedPct,
    },
    Low: {
      total: lowPriorityTotalCount,
      completed: lowPriorityCompletedCount,
      pending: lowPriorityTotalCount - lowPriorityCompletedCount,
      pct: lowPriorityCompletedPct,
    },
  };

  // Daily statistics for Monday - Sunday
  const dailyStats: DailyStat[] = DAYS_OF_WEEK.map((day) => {
    const dayTasks = tasks.filter((t) => t.day === day);
    const dayTotal = dayTasks.length;
    const dayCompleted = dayTasks.filter((t) => t.status === 'completed').length;
    const dayPending = dayTotal - dayCompleted;
    const dayPct = dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0;
    return {
      day,
      total: dayTotal,
      completed: dayCompleted,
      pending: dayPending,
      pct: dayPct,
    };
  });

  // Goals Completed Calculation
  // A goal is counted as completed if the day's tasks are at least 75% completed (or fully completed if <=2 tasks)
  let goalsTotalCount = 0;
  let goalsCompletedCount = 0;
  DAYS_OF_WEEK.forEach((day) => {
    const dayTasks = tasks.filter((t) => t.day === day);
    if (dayTasks.length > 0) {
      goalsTotalCount++;
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const pct = (completed / dayTasks.length) * 100;
      if (pct >= 75) {
        goalsCompletedCount++;
      }
    }
  });
  const goalsCompletedPct =
    goalsTotalCount > 0 ? Math.round((goalsCompletedCount / goalsTotalCount) * 100) : 0;

  // Subject-wise performance
  const subjectMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const sub = t.subject.trim() || 'General';
    const current = subjectMap.get(sub) || { total: 0, completed: 0 };
    current.total += 1;
    if (t.status === 'completed') {
      current.completed += 1;
    }
    subjectMap.set(sub, current);
  });

  const subjectStats: SubjectStat[] = Array.from(subjectMap.entries()).map(
    ([subject, data]) => {
      const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      return {
        subject,
        total: data.total,
        completed: data.completed,
        pending: data.total - data.completed,
        pct,
      };
    }
  );
  // Sort subjects by total tasks descending
  subjectStats.sort((a, b) => b.total - a.total);

  // Daily consistency score (standard deviation / consistency of daily completions)
  const activeDays = dailyStats.filter((d) => d.total > 0);
  let consistencyScore = 80;
  if (activeDays.length > 0) {
    const avgPct = activeDays.reduce((acc, d) => acc + d.pct, 0) / activeDays.length;
    const variance =
      activeDays.reduce((acc, d) => acc + Math.pow(d.pct - avgPct, 2), 0) / activeDays.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation = higher consistency
    consistencyScore = Math.max(20, Math.min(100, Math.round(100 - stdDev * 0.75)));
  }

  // Calculate overall performance score out of 100
  // Formula: 40% task completion + 25% high priority + 20% goals + 15% consistency
  let calculatedScore = 0;
  if (totalTasks > 0) {
    calculatedScore = Math.round(
      overallCompletion * 0.40 +
      highPriorityCompletedPct * 0.25 +
      goalsCompletedPct * 0.20 +
      consistencyScore * 0.15
    );
  } else {
    calculatedScore = 0;
  }
  const overallScore = Math.min(100, Math.max(0, calculatedScore));

  // Determine Performance Level
  let performanceLevel = {
    label: 'Poor',
    description: 'Needs immediate attention and structured task management',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500',
    bgColor: 'bg-rose-500',
  };

  if (overallScore >= 90) {
    performanceLevel = {
      label: 'Excellent',
      description: 'Outstanding execution and peak weekly focus!',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500',
    };
  } else if (overallScore >= 75) {
    performanceLevel = {
      label: 'Very Good',
      description: 'Strong productivity and high commitment follow-through',
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500',
    };
  } else if (overallScore >= 60) {
    performanceLevel = {
      label: 'Good',
      description: 'Solid progress made, with clear opportunities for optimization',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500',
    };
  } else if (overallScore >= 40) {
    performanceLevel = {
      label: 'Needs Improvement',
      description: 'Key deliverables are falling behind schedule',
      badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-500',
    };
  }

  // Generate automated dynamic Strengths, Areas to Improve, and Recommendations
  const strengths: string[] = [];
  const areasToImprove: string[] = [];
  const recommendations: string[] = [];

  // Best & worst days
  const validDays = dailyStats.filter((d) => d.total > 0);
  const bestDay = validDays.length > 0 ? [...validDays].sort((a, b) => b.pct - a.pct)[0] : null;
  const worstDay = validDays.length > 0 ? [...validDays].sort((a, b) => a.pct - b.pct)[0] : null;

  // Best & worst subjects
  const validSubjs = subjectStats.filter((s) => s.total > 0);
  const bestSubj = validSubjs.length > 0 ? [...validSubjs].sort((a, b) => b.pct - a.pct)[0] : null;
  const worstSubj = validSubjs.length > 0 ? [...validSubjs].sort((a, b) => a.pct - b.pct)[0] : null;

  // Strengths deduction
  if (bestDay && bestDay.total > 0) {
    strengths.push(`You performed best on ${bestDay.day} with ${bestDay.pct}% task completion.`);
  }
  if (bestSubj && bestSubj.total > 0 && bestSubj.pct >= 70) {
    strengths.push(`You completed ${bestSubj.pct}% of your ${bestSubj.subject} tasks.`);
  }
  if (highPriorityCompletedPct >= 70) {
    strengths.push(`You completed ${highPriorityCompletedPct}% of your high-priority tasks.`);
  } else if (overallCompletion >= 70) {
    strengths.push(`Strong completion momentum achieved at ${overallCompletion}% across the active days.`);
  }
  if (strengths.length < 3) {
    strengths.push(`Consistently logged daily goals across ${activeDays.length} active planning days.`);
  }

  // Areas to Improve deduction
  if (worstDay && worstDay.total > 0 && worstDay.pct < 80) {
    areasToImprove.push(`${worstDay.day} has the lowest completion rate (${worstDay.pct}%).`);
  }
  const pendingHigh = highPriorityTotalCount - highPriorityCompletedCount;
  if (pendingHigh > 0) {
    areasToImprove.push(`${pendingHigh} high-priority ${pendingHigh === 1 ? 'task is' : 'tasks are'} still pending.`);
  }
  if (worstSubj && bestSubj && worstSubj.subject !== bestSubj.subject && worstSubj.pct < bestSubj.pct) {
    areasToImprove.push(`${worstSubj.subject} tasks have a lower completion rate (${worstSubj.pct}%) than ${bestSubj.subject} (${bestSubj.pct}%).`);
  }
  if (areasToImprove.length < 3 && pendingTasks > 0) {
    areasToImprove.push(`Total of ${pendingTasks} pending tasks remaining across the planner.`);
  }
  if (areasToImprove.length < 3) {
    areasToImprove.push(`Keep daily task estimations balanced to avoid weekend backlog.`);
  }

  // Recommendations deduction
  if (pendingHigh > 0) {
    recommendations.push(`Try completing high-priority tasks earlier in the day during your peak focus window.`);
  }
  if (worstDay && (worstDay.day === 'Saturday' || worstDay.day === 'Sunday')) {
    recommendations.push(`Reduce the number of heavy tasks planned for ${worstDay.day} and reserve it for revision.`);
  } else if (worstDay) {
    recommendations.push(`Break down complex tasks on ${worstDay.day} into smaller 25-minute sub-steps.`);
  }
  if (worstSubj && worstSubj.pct < 70) {
    recommendations.push(`Schedule an extra 45-minute focused study block for ${worstSubj.subject} on Monday or Tuesday.`);
  }
  recommendations.push(`Aim for 3–5 high-impact daily tasks rather than overloading your daily plan.`);

  return {
    overallCompletion,
    completedTasks,
    totalTasks,
    pendingTasks,
    highPriorityTotalCount,
    highPriorityCompletedCount,
    highPriorityCompletedPct,
    mediumPriorityCompletedPct,
    lowPriorityCompletedPct,
    goalsTotalCount,
    goalsCompletedCount,
    goalsCompletedPct,
    consistencyScore,
    overallScore,
    performanceLevel,
    dailyStats,
    subjectStats,
    priorityStats,
    strengths,
    areasToImprove,
    recommendations: recommendations.slice(0, 3),
  };
}
