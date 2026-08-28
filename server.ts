import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// AI Weekly Performance Analysis Endpoint
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { weekData, metrics } = req.body;

    if (!weekData || !metrics) {
      return res.status(400).json({ error: "Missing weekData or metrics payload" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // If GEMINI_API_KEY is not present, generate an intelligent, high-fidelity algorithmic analysis based directly on user's metrics
      const fallbackReport = generateAlgorithmicAnalysis(weekData, metrics);
      return res.json({
        report: fallbackReport,
        mode: "rule-based",
      });
    }

    const prompt = `You are an expert Productivity Coach & Academic/Professional Mentor analyzing a user's weekly planner and performance data.

Analyze the user's actual weekly planner statistics and task logs below:

WEEK METRICS:
- Overall Completion: ${metrics.overallCompletion}%
- Tasks Completed: ${metrics.completedTasks} / ${metrics.totalTasks}
- Pending Tasks: ${metrics.pendingTasks}
- High Priority Tasks Completed: ${metrics.highPriorityCompletedPct}% (${metrics.highPriorityCompletedCount}/${metrics.highPriorityTotalCount})
- Goals Completed: ${metrics.goalsCompletedPct}% (${metrics.goalsCompletedCount}/${metrics.goalsTotalCount})
- Daily Performance Breakdown:
${metrics.dailyStats.map((d: any) => `  * ${d.day}: ${d.completed}/${d.total} completed (${d.pct}%)`).join("\n")}
- Subject-wise Performance:
${metrics.subjectStats.map((s: any) => `  * ${s.subject}: ${s.completed}/${s.total} completed (${s.pct}%)`).join("\n")}
- Priority Breakdown:
  * High: ${metrics.highPriorityCompletedPct}%
  * Medium: ${metrics.mediumPriorityCompletedPct}%
  * Low: ${metrics.lowPriorityCompletedPct}%

SAMPLE TASKS & GOALS:
${weekData.tasks.map((t: any) => `- [${t.status === 'completed' ? '✓' : ' '}] ${t.day} | ${t.subject} | Goal: ${t.goal} | Priority: ${t.priority} | Task: ${t.taskName}`).join("\n")}

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "overallScore": number (0-100 calculated thoughtfully based on the data),
  "summary": string (1-2 sentences summarizing their week directly),
  "strengths": [string, string, string] (3 distinct points on what went well, citing specific subjects, days, or priorities),
  "whatNeedsImprovement": [string, string, string] (3 actionable points on what lagged or needs attention),
  "nextWeekRecommendations": [string, string, string, string] (4 clear, high-impact tactical recommendations for next week)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    try {
      const parsed = JSON.parse(text);
      return res.json({ report: parsed, mode: "gemini" });
    } catch {
      // In case JSON parsing fails, fallback
      const fallbackReport = generateAlgorithmicAnalysis(weekData, metrics);
      return res.json({ report: fallbackReport, mode: "rule-based" });
    }
  } catch (err: any) {
    console.error("AI Analysis error:", err);
    // Fallback gracefully so user always gets their analysis
    try {
      const { weekData, metrics } = req.body;
      const fallbackReport = generateAlgorithmicAnalysis(weekData, metrics);
      return res.json({ report: fallbackReport, mode: "rule-based", fallback: true });
    } catch {
      return res.status(500).json({ error: "Failed to generate analysis" });
    }
  }
});

// Algorithmic analysis generator for instant local or offline calculations
function generateAlgorithmicAnalysis(weekData: any, metrics: any) {
  const compPct = metrics.overallCompletion || 0;
  const highPct = metrics.highPriorityCompletedPct || 0;
  const score = Math.round(
    compPct * 0.45 +
    highPct * 0.25 +
    (metrics.goalsCompletedPct || 0) * 0.20 +
    (metrics.consistencyScore || 70) * 0.10
  );

  // Find best and worst days
  const validDaily = metrics.dailyStats.filter((d: any) => d.total > 0);
  let bestDay = validDaily.length > 0 ? validDaily.reduce((prev: any, curr: any) => curr.pct > prev.pct ? curr : prev, validDaily[0]) : null;
  let worstDay = validDaily.length > 0 ? validDaily.reduce((prev: any, curr: any) => curr.pct < prev.pct ? curr : prev, validDaily[0]) : null;

  // Find best subject
  const validSubjs = metrics.subjectStats.filter((s: any) => s.total > 0);
  let bestSubj = validSubjs.length > 0 ? validSubjs.reduce((prev: any, curr: any) => curr.pct > prev.pct ? curr : prev, validSubjs[0]) : null;
  let worstSubj = validSubjs.length > 0 ? validSubjs.reduce((prev: any, curr: any) => curr.pct < prev.pct ? curr : prev, validSubjs[0]) : null;

  const strengths = [];
  if (compPct >= 70) strengths.push(`Strong overall task completion at ${compPct}% across the week.`);
  if (bestDay && bestDay.total > 0) strengths.push(`Peak productivity achieved on ${bestDay.day} with ${bestDay.pct}% completion (${bestDay.completed}/${bestDay.total} tasks).`);
  if (bestSubj && bestSubj.total > 0) strengths.push(`High focus and mastery demonstrated in ${bestSubj.subject} (${bestSubj.pct}% completed).`);
  if (highPct >= 75) strengths.push(`Exceptional priority triage with ${highPct}% of high-priority commitments finished.`);
  if (strengths.length < 3) strengths.push(`Maintained steady scheduling consistency throughout weekday blocks.`);

  const whatNeedsImprovement = [];
  if (worstDay && worstDay.total > 0 && worstDay.pct < 70) {
    whatNeedsImprovement.push(`${worstDay.day} showed lower execution (${worstDay.pct}% completed), indicating energy depletion or over-scheduling.`);
  }
  if (metrics.pendingTasks > 0) {
    whatNeedsImprovement.push(`${metrics.pendingTasks} tasks remained pending by the end of the week.`);
  }
  if (worstSubj && worstSubj.pct < 70 && worstSubj.total > 0) {
    whatNeedsImprovement.push(`${worstSubj.subject} had a lower completion rate (${worstSubj.pct}%) and could benefit from smaller task breakdowns.`);
  }
  if (highPct < 70 && metrics.highPriorityTotalCount > 0) {
    whatNeedsImprovement.push(`${metrics.highPriorityTotalCount - metrics.highPriorityCompletedCount} high-priority tasks were postponed or unfinished.`);
  }
  if (whatNeedsImprovement.length < 3) {
    whatNeedsImprovement.push(`Weekend momentum slowed down compared to peak midweek cadence.`);
  }

  const nextWeekRecommendations = [
    `Limit daily scheduled commitments to 3–5 core tasks to prevent end-of-day cognitive overload.`,
    `Tackle top high-priority tasks during your peak morning focus window before starting low-priority items.`,
    worstSubj ? `Allocate dedicated focused blocks for ${worstSubj.subject} earlier in the week.` : `Reserve Friday afternoon or Sunday evening for a 30-minute weekly review and adjustment session.`,
    `Carry over remaining unfinished tasks into next week's planner with adjusted estimates.`
  ];

  return {
    overallScore: Math.min(100, Math.max(10, score)),
    summary: `You completed ${compPct}% of your planned tasks this week (${metrics.completedTasks}/${metrics.totalTasks} tasks) with an overall performance score of ${score}/100.`,
    strengths: strengths.slice(0, 3),
    whatNeedsImprovement: whatNeedsImprovement.slice(0, 3),
    nextWeekRecommendations: nextWeekRecommendations.slice(0, 4),
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
