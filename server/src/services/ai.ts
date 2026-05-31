import { RoadmapNode, StudySession, StudyTask, User } from "../types.js";
import { flattenRoadmap, nextBestTopics } from "./planner.js";

export interface StudyPlanRequest {
  user: User;
  roadmap: RoadmapNode[];
  tasks: StudyTask[];
  sessions?: StudySession[];
  availableMinutes?: number;
}

export async function generateStudyPlan({
  user,
  roadmap,
  tasks,
  sessions = [],
  availableMinutes
}: StudyPlanRequest) {
  const minutes = availableMinutes ?? (user.profile.dailyStudyHours ?? 3) * 60;
  const topics = nextBestTopics(roadmap, 5);
  const pendingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority] || a.dueDate.localeCompare(b.dueDate);
    });
  const leastStudiedSubject = findLeastStudiedSubject(roadmap, sessions);
  const focusTopic =
    topics.find((topic) => topic.title.includes(leastStudiedSubject ?? ""))?.title ??
    topics[0]?.title ??
    pendingTasks[0]?.title ??
    "Core revision";
  const weeklyTopics =
    topics.length > 0
      ? topics.map((topic) => topic.title)
      : pendingTasks.slice(0, 5).map((task) => task.title);
  const goal = user.profile.targetJob ?? user.profile.examName ?? "your goal";
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalStudyMinutes = sessions.reduce((sum, item) => sum + item.focusMinutes, 0);

  return {
    source: "dynamic-local-planner",
    headline: `Study ${focusTopic} next`,
    reason:
      `Prioritized from ${topics.length} open roadmap topics, ${pendingTasks.length} pending tasks, ${completedTasks} completed tasks, and ${Math.round(totalStudyMinutes / 60)} logged study hours.`,
    dailyPlan: [
      {
        block: "Deep Work",
        minutes: Math.min(90, minutes),
        activity: focusTopic
      },
      {
        block: "Revision",
        minutes: Math.min(45, Math.max(25, Math.round(minutes * 0.25))),
        activity: pendingTasks[0]?.title ?? "Revise last completed topic"
      },
      {
        block: "Practice",
        minutes: Math.min(60, Math.max(30, Math.round(minutes * 0.3))),
        activity: pendingTasks[1]?.title ?? "Attempt a timed question set"
      }
    ],
    weeklyPlan: weeklyTopics.map((topic, index) => ({
      day: `Day ${index + 1}`,
      focus: topic,
      output:
        index % 3 === 0
          ? "Concept notes + 10-question quiz"
          : index % 3 === 1
            ? "Timed practice set + error log"
            : "Revision card + one mock drill"
    })),
    monthlyPlan: buildMonthlyPlan(goal, roadmap, tasks, sessions),
    estimatedCompletionDate: estimateCompletionDate(roadmap, minutes)
  };
}

export function predictPerformance({
  completionRate,
  consistency,
  mockAverage,
  studyHours
}: {
  completionRate: number;
  consistency: number;
  mockAverage: number;
  studyHours: number;
}) {
  const readiness = Math.round(
    completionRate * 0.38 + consistency * 0.24 + mockAverage * 0.3 + studyHours * 0.08
  );
  return {
    readiness: Math.min(98, readiness),
    successProbability: Math.min(95, Math.round(readiness * 0.88)),
    insight:
      readiness > 75
        ? "You are on a strong path. Protect consistency and deepen revision."
        : "Your fastest improvement will come from closing active topics and reviewing mock mistakes."
  };
}

function estimateCompletionDate(roadmap: RoadmapNode[], dailyMinutes: number) {
  const remainingHours = flattenRoadmap(roadmap)
    .filter((item) => item.status !== "completed")
    .reduce((sum, item) => sum + item.estimatedHours * (1 - item.progress / 100), 0);
  const dailyHours = Math.max(1, dailyMinutes / 60);
  const date = new Date();
  date.setDate(date.getDate() + Math.ceil(remainingHours / dailyHours));
  return date.toISOString().slice(0, 10);
}

function buildMonthlyPlan(
  goal: string,
  roadmap: RoadmapNode[],
  tasks: StudyTask[],
  sessions: StudySession[]
) {
  const activeModules = flattenRoadmap(roadmap)
    .filter((item) => item.type === "module" && item.status !== "completed")
    .slice(0, 2);
  const overdueTasks = tasks.filter(
    (task) => task.status !== "completed" && task.dueDate < new Date().toISOString().slice(0, 10)
  );
  const mockTasks = tasks.filter(
    (task) => task.category === "Mock Tests" && task.status !== "completed"
  );
  const studiedSubjects = new Set(sessions.map((session) => session.subject.toLowerCase()));

  return [
    activeModules[0]
      ? `Move ${activeModules[0].title} above 75% completion for ${goal}`
      : `Add the next high-impact module for ${goal}`,
    activeModules[1]
      ? `Start ${activeModules[1].title} with two focused weekly blocks`
      : "Use saved notes to create a compact revision checklist",
    mockTasks[0]
      ? `Complete "${mockTasks[0].title}" and record mistakes`
      : "Run one full mock test and update the error notebook",
    overdueTasks.length
      ? `Clear ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`
      : studiedSubjects.size
        ? `Balance weak subjects against ${studiedSubjects.size} subjects already studied`
        : "Log at least five study sessions to improve planner accuracy"
  ];
}

function findLeastStudiedSubject(roadmap: RoadmapNode[], sessions: StudySession[]) {
  const topics = flattenRoadmap(roadmap).filter((item) => item.type === "topic");
  if (!topics.length) return undefined;
  const minutesBySubject = new Map<string, number>();
  for (const session of sessions) {
    minutesBySubject.set(
      session.subject.toLowerCase(),
      (minutesBySubject.get(session.subject.toLowerCase()) ?? 0) + session.focusMinutes
    );
  }
  return topics
    .map((topic) => ({
      title: topic.title,
      minutes: [...minutesBySubject.entries()]
        .filter(([subject]) => topic.title.toLowerCase().includes(subject))
        .reduce((sum, [, minutes]) => sum + minutes, 0)
    }))
    .sort((a, b) => a.minutes - b.minutes)[0]?.title;
}
