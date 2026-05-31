export type Persona =
  | "government"
  | "college"
  | "job-seeker"
  | "self-learner";

export type TopicStatus = "not-started" | "in-progress" | "completed";
export type RoadmapNodeType = "subject" | "module" | "topic" | "subtopic";
export type TaskCategory =
  | "Study"
  | "Revision"
  | "Mock Tests"
  | "Projects"
  | "Interview Practice";
export type Priority = "low" | "medium" | "high";

export interface UserProfile {
  examName?: string;
  targetJob?: string;
  collegeDegree?: string;
  branch?: string;
  examDate?: string;
  dailyStudyHours?: number;
  currentSkillLevel?: "beginner" | "intermediate" | "advanced";
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  persona: Persona;
  profile: UserProfile;
  emailVerified: boolean;
  googleId?: string;
  xp: number;
  streak: number;
  level: "Beginner" | "Learner" | "Achiever" | "Expert" | "Master";
  createdAt: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  type: RoadmapNodeType;
  status: TopicStatus;
  estimatedHours: number;
  progress: number;
  nextRevision?: string;
  children: RoadmapNode[];
}

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  priority: Priority;
  status: TopicStatus;
  dueDate: string;
  estimatedMinutes: number;
  order: number;
}

export interface StudySession {
  id: string;
  userId: string;
  mode: "25/5" | "50/10" | "custom";
  focusMinutes: number;
  breakMinutes: number;
  completedAt: string;
  subject: string;
}

export interface MockScore {
  id: string;
  userId: string;
  label: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  type: "Note" | "PDF" | "Link" | "YouTube";
  subject: string;
  body: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  label: string;
  type: "Task" | "Revision" | "Exam" | "Mock" | "Project" | "Goal" | "Study";
  sourceId?: string;
}

export interface CommunityPost {
  id: string;
  group: string;
  author: string;
  title: string;
  replies: number;
  createdAt: string;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
}
