import { WeekPlan, Task, DayOfWeek, DayGoal, AIReport } from '../types';
import { INITIAL_WEEKS, INITIAL_DAY_GOALS } from '../data/initialData';

const STORAGE_KEY_WEEKS = 'weekly_planner_weeks_v2';
const STORAGE_KEY_ACTIVE_WEEK = 'weekly_planner_active_week_id';
const STORAGE_KEY_THEME = 'weekly_planner_theme';
const STORAGE_KEY_SOUND = 'weekly_planner_sound_enabled';

export function getStoredWeeks(): WeekPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEEKS);
    if (!raw) {
      saveWeeks(INITIAL_WEEKS);
      return INITIAL_WEEKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_WEEKS;
  } catch (e) {
    console.error('Error loading weeks from localStorage', e);
    return INITIAL_WEEKS;
  }
}

export function saveWeeks(weeks: WeekPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(weeks));
  } catch (e) {
    console.error('Error saving weeks to localStorage', e);
  }
}

export function getActiveWeekId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_WEEK);
    return active || 'week-4';
  } catch {
    return 'week-4';
  }
}

export function saveActiveWeekId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_WEEK, id);
  } catch (e) {
    console.error('Error saving active week id', e);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
}

export function getStoredSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_SOUND);
    return val !== 'false';
  } catch {
    return true;
  }
}

export function saveStoredSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
  } catch (e) {
    console.error('Error saving sound setting', e);
  }
}

// Audio synthesizer for crisp task completion tick sound (pure Web Audio API, no external files)
export function playCompletionSound(): void {
  try {
    if (!getStoredSoundEnabled()) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio chime effect
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.16); // D6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio context block if restricted
  }
}

export function createNewWeekPlan(weeks: WeekPlan[], name?: string): { updatedWeeks: WeekPlan[]; newWeek: WeekPlan } {
  const nextNum = weeks.length + 1;
  const newId = `week-${nextNum}`;
  const now = new Date();
  const startDateStr = now.toISOString().split('T')[0];
  const endDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const endDateStr = endDate.toISOString().split('T')[0];

  const newWeek: WeekPlan = {
    id: newId,
    name: name || `Week ${nextNum}: New Weekly Goal`,
    startDate: startDateStr,
    endDate: endDateStr,
    dayGoals: { ...INITIAL_DAY_GOALS },
    tasks: [],
    aiAnalysis: null,
  };

  const updated = [...weeks, newWeek];
  saveWeeks(updated);
  saveActiveWeekId(newId);
  return { updatedWeeks: updated, newWeek };
}

export function carryOverPendingTasks(
  sourceWeek: WeekPlan,
  targetWeekId: string,
  weeks: WeekPlan[]
): WeekPlan[] {
  const pending = sourceWeek.tasks.filter((t) => t.status === 'pending');
  const targetWeek = weeks.find((w) => w.id === targetWeekId);
  if (!targetWeek) return weeks;

  const clonedTasks: Task[] = pending.map((t, idx) => ({
    ...t,
    id: `cloned-${Date.now()}-${idx}`,
    weekId: targetWeekId,
    createdDate: new Date().toISOString(),
    completedDate: null,
    status: 'pending',
  }));

  const updatedTarget: WeekPlan = {
    ...targetWeek,
    tasks: [...targetWeek.tasks, ...clonedTasks],
  };

  const updatedWeeks = weeks.map((w) => (w.id === targetWeekId ? updatedTarget : w));
  saveWeeks(updatedWeeks);
  return updatedWeeks;
}
