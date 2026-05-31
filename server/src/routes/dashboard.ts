import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { generateStudyPlan, predictPerformance } from "../services/ai.js";
import { flattenRoadmap, nextBestTopics } from "../services/planner.js";
import { store } from "../services/store.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = store.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const roadmap = store.getRoadmap(user.id);
  const tasks = store.getTasks(user.id);
  const sessions = store.getSessions(user.id);
  const scores = store.getMockScores(user.id);
  const notes = store.getNotes(user.id);
  const calendarEvents = store.getCalendarEvents(user.id);
  const flat = flattenRoadmap(roadmap);
  const topics = flat.filter((item) => item.type === "topic");
  const completed = topics.filter((item) => item.status === "completed").length;
  const completionRate = topics.length
    ? Math.round((completed / topics.length) * 100)
    : 0;
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const studyMinutes = sessions.reduce((sum, item) => sum + item.focusMinutes, 0);
  const todayMinutes = sessions
    .filter((item) => item.completedAt.slice(0, 10) === today)
    .reduce((sum, item) => sum + item.focusMinutes, 0);
  const weeklyMinutes = sessions
    .filter((item) => new Date(item.completedAt) >= weekAgo)
    .reduce((sum, item) => sum + item.focusMinutes, 0);
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const tasksDueToday = tasks.filter(
    (task) => task.dueDate === today && task.status !== "completed"
  ).length;
  const taskCompletionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const mockAverage = scores.length
    ? Math.round(
        scores.reduce((sum, item) => sum + (item.score / item.total) * 100, 0) /
          scores.length
      )
    : 50;

  const performance = predictPerformance({
    completionRate,
    consistency: Math.min(100, calculateStreak(sessions) * 6),
    mockAverage,
    studyHours: Math.min(100, Math.round(weeklyMinutes / 12))
  });

  const dynamicXp = completed * 120 + completedTasks * 45 + Math.round(studyMinutes / 5);
  const level =
    dynamicXp >= 6000
      ? "Master"
      : dynamicXp >= 3600
        ? "Expert"
        : dynamicXp >= 1800
          ? "Achiever"
          : dynamicXp >= 600
            ? "Learner"
            : "Beginner";

  const plan = await generateStudyPlan({ user, roadmap, tasks, sessions });

  res.json({
    user,
    metrics: {
      dailyGoal: user.profile.dailyStudyHours ?? 3,
      weeklyGoal: (user.profile.dailyStudyHours ?? 3) * 6,
      monthlyGoal: (user.profile.dailyStudyHours ?? 3) * 24,
      streak: calculateStreak(sessions),
      hoursStudied: Math.round((studyMinutes / 60) * 10) / 10,
      hoursToday: Math.round((todayMinutes / 60) * 10) / 10,
      weeklyHoursStudied: Math.round((weeklyMinutes / 60) * 10) / 10,
      topicsCompleted: completed,
      remainingTopics: Math.max(0, topics.length - completed),
      completionRate,
      tasksCompleted: completedTasks,
      totalTasks: tasks.length,
      tasksDueToday,
      taskCompletionRate,
      upcomingRevisions: flat.filter((item) => item.nextRevision).slice(0, 5),
      examCountdown: user.profile.examDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(user.profile.examDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : null,
      xp: dynamicXp,
      level,
      performance
    },
    roadmap,
    tasks,
    sessions,
    scores,
    notes,
    calendarEvents,
    nextTopics: nextBestTopics(roadmap),
    plan
  });
});

export default router;

function calculateStreak(sessions: Array<{ completedAt: string }>) {
  const studiedDays = new Set(sessions.map((session) => session.completedAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (studiedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
