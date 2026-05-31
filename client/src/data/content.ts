import {
  BarChart3,
  BellRing,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  KanbanSquare,
  LineChart,
  NotebookTabs,
  Trophy,
  UsersRound
} from "lucide-react";

export const features = [
  {
    icon: BrainCircuit,
    title: "AI Study Planner",
    body: "Daily, weekly, and monthly plans based on weak areas, goals, time, and exam dates."
  },
  {
    icon: KanbanSquare,
    title: "Roadmap Builder",
    body: "Track subjects, modules, topics, and subtopics with visual completion status."
  },
  {
    icon: BellRing,
    title: "Revision Reminders",
    body: "Day 1, 3, 7, 15, 30, and 60 spaced repetition schedules."
  },
  {
    icon: LineChart,
    title: "Progress Analytics",
    body: "Charts for hours, completion, mock performance, and consistency."
  },
  {
    icon: Trophy,
    title: "Gamification",
    body: "XP, streaks, badges, leaderboards, levels, and achievement loops."
  },
  {
    icon: NotebookTabs,
    title: "Notes & Resources",
    body: "Organize notes, PDFs, links, and YouTube resources by subject."
  }
];

export const audienceModes = [
  {
    title: "Government Exam Aspirant",
    items: ["UPSC", "SSC", "Railway", "Banking", "GATE", "CAT", "NEET", "JEE"],
    icon: GraduationCap
  },
  {
    title: "College Student",
    items: ["Degree planning", "Branch subjects", "Projects", "Placement prep"],
    icon: CheckCircle2
  },
  {
    title: "Job Seeker",
    items: ["DSA", "System design", "Resume", "Portfolio", "Mock interviews"],
    icon: BarChart3
  },
  {
    title: "Self Learner",
    items: ["AI/ML", "Data Science", "Web Dev", "Software Engineering"],
    icon: Bot
  }
];

export const successStories = [
  {
    name: "Priya S.",
    outcome: "Banking prelims cleared",
    quote:
      "The revision queue helped me stop re-reading randomly and start improving every mock."
  },
  {
    name: "Arjun M.",
    outcome: "Data analyst offer",
    quote:
      "I used the roadmap and project tracker to move from tutorials to portfolio work."
  },
  {
    name: "Nisha K.",
    outcome: "GATE prep consistency",
    quote:
      "The streaks and weekly analytics made my preparation visible for the first time."
  }
];

export const faqs = [
  {
    q: "Does Study Help support Indian government exams?",
    a: "Yes. The structure supports UPSC, SSC, Banking, Railway, GATE, CAT, NEET, JEE, and custom exam plans."
  },
  {
    q: "Can I use it for placements and job interviews?",
    a: "Yes. Career mode tracks DSA, core CS subjects, projects, resume work, portfolio progress, and mock interviews."
  },
  {
    q: "Does the app require AI credentials locally?",
    a: "No. It has a dynamic local planner for development. Add OpenAI or Gemini credentials when you want live AI output."
  }
];

export const navItems = [
  "Dashboard",
  "Roadmap",
  "Planner",
  "Sessions",
  "Analytics",
  "Calendar",
  "Notes",
  "Career",
  "Community",
  "Admin"
] as const;

export const calendarEvents = [
  { date: "2026-06-01", label: "SQL revision", type: "Revision" },
  { date: "2026-06-03", label: "Mock test", type: "Mock" },
  { date: "2026-06-07", label: "Portfolio review", type: "Project" },
  { date: "2026-06-15", label: "Monthly plan review", type: "Goal" }
];

export const achievements = [
  { label: "18 day streak", icon: Flame, tone: "text-flame" },
  { label: "7 revisions done", icon: CalendarDays, tone: "text-sea" },
  { label: "4 community assists", icon: UsersRound, tone: "text-cobalt" }
];
