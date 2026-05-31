import {
  DashboardResponse,
  StudyNote,
  Persona,
  StudyPlan,
  StudySession,
  StudyTask,
  TopicStatus,
  User,
  UserProfile
} from "../types";

const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api";

interface AuthResponse {
  token: string;
  user: User;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // Keep the generic message when the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  signup(input: {
    name: string;
    email: string;
    password: string;
    persona: Persona;
  }) {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  me(token: string) {
    return request<{ user: User }>("/auth/me", {}, token);
  },

  onboarding(token: string, input: UserProfile & { persona?: Persona }) {
    return request<Pick<DashboardResponse, "user" | "roadmap" | "tasks">>(
      "/onboarding",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  dashboard(token: string) {
    return request<DashboardResponse>("/dashboard", {}, token);
  },

  updateRoadmap(token: string, topicId: string, status: TopicStatus) {
    return request<Pick<DashboardResponse, "roadmap">>(
      `/roadmap/${topicId}`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token
    );
  },

  createTask(token: string, task: Omit<StudyTask, "id" | "userId" | "order">) {
    return request<{ task: StudyTask }>(
      "/tasks",
      { method: "POST", body: JSON.stringify(task) },
      token
    );
  },

  updateTask(token: string, taskId: string, task: Partial<StudyTask>) {
    return request<{ task: StudyTask }>(
      `/tasks/${taskId}`,
      { method: "PATCH", body: JSON.stringify(task) },
      token
    );
  },

  deleteTask(token: string, taskId: string) {
    return request<void>(`/tasks/${taskId}`, { method: "DELETE" }, token);
  },

  reorderTasks(token: string, ids: string[]) {
    return request<{ tasks: StudyTask[] }>(
      "/tasks/reorder",
      { method: "POST", body: JSON.stringify({ ids }) },
      token
    );
  },

  createSession(token: string, input: Omit<StudySession, "id" | "userId">) {
    return request<{ session: StudySession }>(
      "/study/sessions",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  createNote(
    token: string,
    input: Omit<StudyNote, "id" | "userId" | "createdAt" | "updatedAt">
  ) {
    return request<{ note: StudyNote }>(
      "/notes",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  updateNote(token: string, noteId: string, input: Partial<StudyNote>) {
    return request<{ note: StudyNote }>(
      `/notes/${noteId}`,
      { method: "PATCH", body: JSON.stringify(input) },
      token
    );
  },

  deleteNote(token: string, noteId: string) {
    return request<void>(`/notes/${noteId}`, { method: "DELETE" }, token);
  },

  studyPlan(token: string, availableMinutes: number) {
    return request<{ plan: StudyPlan }>(
      "/ai/study-plan",
      { method: "POST", body: JSON.stringify({ availableMinutes }) },
      token
    );
  },

  interviewCoach(token: string, role: string) {
    return request<{
      coach: { questions: string[]; feedbackRubric: string[] };
    }>(
      "/ai/interview-coach",
      { method: "POST", body: JSON.stringify({ role }) },
      token
    );
  },

  admin(token: string) {
    return request<{
      users: number;
      communities: string[];
      reports: number;
      premiumConversion: number;
      activeToday: number;
    }>("/admin/overview", {}, token);
  },

  communityPosts(token: string) {
    return request<{
      posts: Array<{
        id: string;
        group: string;
        author: string;
        title: string;
        replies: number;
        createdAt: string;
      }>;
    }>("/admin/community-posts", {}, token);
  }
};
