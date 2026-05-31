import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import {
  CalendarEvent,
  CommunityPost,
  MockScore,
  Persona,
  RoadmapNode,
  StudyNote,
  StudySession,
  StudyTask,
  TopicStatus,
  User,
  UserProfile
} from "../types.js";
import {
  buildPersonalizedRoadmap,
  buildRevisionDates,
  calculateRoadmapProgress,
  flattenRoadmap,
  nextBestTopics
} from "./planner.js";

interface PersistedState {
  users: User[];
  roadmaps: Record<string, RoadmapNode[]>;
  tasks: Record<string, StudyTask[]>;
  sessions: Record<string, StudySession[]>;
  mockScores: Record<string, MockScore[]>;
  notes: Record<string, StudyNote[]>;
  communityPosts: CommunityPost[];
}

const now = () => new Date().toISOString();
const id = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;

const storeFile = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../data/store.json"
);

const users = new Map<string, User>();
const usersByEmail = new Map<string, string>();
const roadmaps = new Map<string, RoadmapNode[]>();
const tasks = new Map<string, StudyTask[]>();
const sessions = new Map<string, StudySession[]>();
const mockScores = new Map<string, MockScore[]>();
const notes = new Map<string, StudyNote[]>();

let communityPosts: CommunityPost[] = [
  {
    id: "post_gate_sql",
    group: "GATE",
    author: "Ananya",
    title: "Best way to revise DBMS joins before mocks?",
    replies: 18,
    createdAt: now()
  },
  {
    id: "post_ds_projects",
    group: "Data Science",
    author: "Rahul",
    title: "Portfolio project checklist for fresher data analyst roles",
    replies: 27,
    createdAt: now()
  },
  {
    id: "post_ssc_streaks",
    group: "SSC",
    author: "Meera",
    title: "Daily quant sprint group for June",
    replies: 42,
    createdAt: now()
  }
];

const seedProfile: UserProfile = {
  examName: "GATE",
  targetJob: "Data Scientist",
  collegeDegree: "B.Tech",
  branch: "Computer Science",
  examDate: "2027-02-07",
  dailyStudyHours: 4,
  currentSkillLevel: "intermediate"
};

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function session(
  userId: string,
  subject: string,
  focusMinutes: number,
  daysAgo: number
): StudySession {
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() + daysAgo);
  return {
    id: id("session"),
    userId,
    mode: focusMinutes >= 50 ? "50/10" : "25/5",
    focusMinutes,
    breakMinutes: focusMinutes >= 50 ? 10 : 5,
    completedAt: completedAt.toISOString(),
    subject
  };
}

function score(
  userId: string,
  label: string,
  value: number,
  total: number,
  daysAgo: number
): MockScore {
  const takenAt = new Date();
  takenAt.setDate(takenAt.getDate() + daysAgo);
  return {
    id: id("score"),
    userId,
    label,
    score: value,
    total,
    takenAt: takenAt.toISOString()
  };
}

function seed() {
  users.clear();
  usersByEmail.clear();
  roadmaps.clear();
  tasks.clear();
  sessions.clear();
  mockScores.clear();
  notes.clear();

  const user: User = {
    id: "demo_user",
    name: "Demo Student",
    email: "demo@studyhelp.local",
    passwordHash: bcrypt.hashSync("password123", 10),
    persona: "job-seeker",
    profile: seedProfile,
    emailVerified: true,
    googleId: undefined,
    xp: 0,
    streak: 0,
    level: "Learner",
    createdAt: now()
  };

  users.set(user.id, user);
  usersByEmail.set(user.email, user.id);
  const roadmap = buildPersonalizedRoadmap(seedProfile, user.persona);
  roadmaps.set(user.id, roadmap);
  tasks.set(user.id, buildStarterTasks(user.id, seedProfile, roadmap));
  sessions.set(user.id, [
    session(user.id, "SQL", 50, -6),
    session(user.id, "Statistics", 75, -5),
    session(user.id, "Machine Learning", 110, -4),
    session(user.id, "Power BI", 45, -3),
    session(user.id, "DSA", 90, -2),
    session(user.id, "Projects", 60, -1),
    session(user.id, "Interview Practice", 40, 0)
  ]);
  mockScores.set(user.id, [
    score(user.id, "Mock 1", 62, 100, -21),
    score(user.id, "Mock 2", 68, 100, -14),
    score(user.id, "Mock 3", 74, 100, -7),
    score(user.id, "Mock 4", 79, 100, -1)
  ]);
  notes.set(user.id, buildDefaultNotes(user.id));
}

function buildDefaultNotes(userId: string): StudyNote[] {
  const timestamp = now();
  return [
    {
      id: "note_sql_patterns",
      userId,
      title: "SQL interview patterns",
      type: "Note",
      subject: "SQL",
      body: "Window functions, CTEs, joins, rank, dense_rank, lag, lead.",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "note_stats_revision",
      userId,
      title: "Statistics revision checklist",
      type: "PDF",
      subject: "Statistics",
      body: "Probability distributions, hypothesis testing, confidence intervals, and regression assumptions.",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "note_mock_playlist",
      userId,
      title: "Mock interview playlist",
      type: "YouTube",
      subject: "Interview",
      body: "Behavioral question drills and project explanation practice.",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}

function saveState() {
  mkdirSync(dirname(storeFile), { recursive: true });
  const state: PersistedState = {
    users: [...users.values()],
    roadmaps: Object.fromEntries(roadmaps),
    tasks: Object.fromEntries(tasks),
    sessions: Object.fromEntries(sessions),
    mockScores: Object.fromEntries(mockScores),
    notes: Object.fromEntries(notes),
    communityPosts
  };
  writeFileSync(storeFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function loadState() {
  if (!existsSync(storeFile)) {
    seed();
    saveState();
    return;
  }

  const state = JSON.parse(readFileSync(storeFile, "utf8")) as Partial<PersistedState>;
  users.clear();
  usersByEmail.clear();
  roadmaps.clear();
  tasks.clear();
  sessions.clear();
  mockScores.clear();
  notes.clear();

  for (const user of state.users ?? []) {
    users.set(user.id, user);
    usersByEmail.set(user.email.toLowerCase(), user.id);
  }

  for (const [userId, items] of Object.entries(state.roadmaps ?? {})) {
    roadmaps.set(userId, items);
  }
  for (const [userId, items] of Object.entries(state.tasks ?? {})) {
    tasks.set(userId, items);
  }
  for (const [userId, items] of Object.entries(state.sessions ?? {})) {
    sessions.set(userId, items);
  }
  for (const [userId, items] of Object.entries(state.mockScores ?? {})) {
    mockScores.set(userId, items);
  }
  for (const [userId, items] of Object.entries(state.notes ?? {})) {
    notes.set(userId, items);
  }
  communityPosts = state.communityPosts?.length ? state.communityPosts : communityPosts;

  ensureMinimumState();
  saveState();
}

function ensureMinimumState() {
  if (!usersByEmail.has("demo@studyhelp.local")) {
    const existingState = {
      users: [...users.values()],
      roadmaps: new Map(roadmaps),
      tasks: new Map(tasks),
      sessions: new Map(sessions),
      mockScores: new Map(mockScores),
      notes: new Map(notes)
    };
    seed();
    for (const user of existingState.users) {
      users.set(user.id, user);
      usersByEmail.set(user.email.toLowerCase(), user.id);
    }
    for (const [userId, items] of existingState.roadmaps) roadmaps.set(userId, items);
    for (const [userId, items] of existingState.tasks) tasks.set(userId, items);
    for (const [userId, items] of existingState.sessions) sessions.set(userId, items);
    for (const [userId, items] of existingState.mockScores) mockScores.set(userId, items);
    for (const [userId, items] of existingState.notes) notes.set(userId, items);
  }

  for (const user of users.values()) {
    const expectedTitle =
      user.persona === "job-seeker" || user.profile.targetJob
        ? user.profile.targetJob || "Software Engineering"
        : user.profile.examName || user.profile.collegeDegree || "Government Exam";
    const currentRoadmap = roadmaps.get(user.id) ?? [];
    if (
      !roadmaps.has(user.id) ||
      getAllTopics(currentRoadmap).length === 0 ||
      (expectedTitle && currentRoadmap[0]?.title !== expectedTitle)
    ) {
      roadmaps.set(user.id, buildPersonalizedRoadmap(user.profile, user.persona));
    }
    if (!tasks.has(user.id)) tasks.set(user.id, []);
    if (!sessions.has(user.id)) sessions.set(user.id, []);
    if (!mockScores.has(user.id)) mockScores.set(user.id, []);
    if (!notes.has(user.id)) notes.set(user.id, buildDefaultNotes(user.id));
  }
}

function persist<T>(value: T) {
  saveState();
  return value;
}

loadState();

export const store = {
  async createUser(input: {
    name: string;
    email: string;
    password?: string;
    persona: Persona;
    googleId?: string;
  }) {
    const existing = usersByEmail.get(input.email.toLowerCase());
    if (existing) return users.get(existing);

    const user: User = {
      id: id("user"),
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.password
        ? await bcrypt.hash(input.password, 10)
        : undefined,
      persona: input.persona,
      profile: {},
      emailVerified: Boolean(input.googleId),
      googleId: input.googleId,
      xp: 0,
      streak: 0,
      level: "Beginner",
      createdAt: now()
    };
    users.set(user.id, user);
    usersByEmail.set(user.email, user.id);
    const roadmap = buildPersonalizedRoadmap({ examName: "Study Help" }, input.persona);
    roadmaps.set(user.id, roadmap);
    tasks.set(user.id, []);
    sessions.set(user.id, []);
    mockScores.set(user.id, []);
    notes.set(user.id, []);
    return persist(user);
  },

  async validatePassword(email: string, password: string) {
    const user = this.findUserByEmail(email);
    if (!user?.passwordHash) return undefined;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : undefined;
  },

  findUserByEmail(email: string) {
    const userId = usersByEmail.get(email.toLowerCase());
    return userId ? users.get(userId) : undefined;
  },

  findUserById(userId: string) {
    return users.get(userId);
  },

  updateProfile(userId: string, profile: UserProfile, persona?: Persona) {
    const user = users.get(userId);
    if (!user) return undefined;
    user.profile = { ...user.profile, ...profile };
    if (persona) user.persona = persona;
    const generatedRoadmap = buildPersonalizedRoadmap(user.profile, user.persona);
    roadmaps.set(userId, generatedRoadmap);
    tasks.set(userId, buildStarterTasks(userId, user.profile, generatedRoadmap));
    return persist(user);
  },

  getRoadmap(userId: string) {
    return roadmaps.get(userId) ?? [];
  },

  updateTopicStatus(userId: string, topicId: string, status: TopicStatus) {
    const userRoadmap = roadmaps.get(userId) ?? [];
    const revisionDates = buildRevisionDates();
    const walk = (nodes: RoadmapNode[]): boolean => {
      for (const nodeItem of nodes) {
        if (nodeItem.id === topicId) {
          nodeItem.status = status;
          nodeItem.progress =
            status === "completed" ? 100 : status === "in-progress" ? 55 : 0;
          nodeItem.nextRevision =
            status === "completed" ? revisionDates[0] : undefined;
          return true;
        }
        if (walk(nodeItem.children)) {
          nodeItem.progress = calculateRoadmapProgress(nodeItem.children);
          nodeItem.status =
            nodeItem.progress === 100
              ? "completed"
              : nodeItem.progress > 0
                ? "in-progress"
                : "not-started";
          return true;
        }
      }
      return false;
    };
    walk(userRoadmap);
    return persist(userRoadmap);
  },

  getTasks(userId: string) {
    return [...(tasks.get(userId) ?? [])].sort((a, b) => a.order - b.order);
  },

  createTask(userId: string, input: Omit<StudyTask, "id" | "userId" | "order">) {
    const userTasks = this.getTasks(userId);
    const task: StudyTask = {
      ...input,
      id: id("task"),
      userId,
      order: userTasks.length + 1
    };
    tasks.set(userId, [...userTasks, task]);
    return persist(task);
  },

  updateTask(userId: string, taskId: string, input: Partial<StudyTask>) {
    const userTasks = this.getTasks(userId);
    const next = userTasks.map((task) =>
      task.id === taskId ? { ...task, ...input, id: task.id, userId } : task
    );
    tasks.set(userId, next);
    return persist(next.find((task) => task.id === taskId));
  },

  deleteTask(userId: string, taskId: string) {
    const next = this.getTasks(userId).filter((task) => task.id !== taskId);
    tasks.set(userId, next);
    persist(undefined);
  },

  reorderTasks(userId: string, ids: string[]) {
    const current = this.getTasks(userId);
    const byId = new Map(current.map((task) => [task.id, task]));
    const ordered = ids
      .map((taskId, index) => {
        const task = byId.get(taskId);
        return task ? { ...task, order: index + 1 } : undefined;
      })
      .filter(Boolean) as StudyTask[];
    const missing = current.filter((task) => !ids.includes(task.id));
    tasks.set(userId, [...ordered, ...missing]);
    return persist(this.getTasks(userId));
  },

  addSession(userId: string, input: Omit<StudySession, "id" | "userId">) {
    const entry: StudySession = { ...input, id: id("session"), userId };
    sessions.set(userId, [entry, ...(sessions.get(userId) ?? [])]);
    return persist(entry);
  },

  getSessions(userId: string) {
    return sessions.get(userId) ?? [];
  },

  getMockScores(userId: string) {
    return mockScores.get(userId) ?? [];
  },

  getNotes(userId: string) {
    return [...(notes.get(userId) ?? [])].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  },

  createNote(userId: string, input: Omit<StudyNote, "id" | "userId" | "createdAt" | "updatedAt">) {
    const timestamp = now();
    const note: StudyNote = {
      ...input,
      id: id("note"),
      userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    notes.set(userId, [note, ...(notes.get(userId) ?? [])]);
    return persist(note);
  },

  updateNote(userId: string, noteId: string, input: Partial<StudyNote>) {
    const userNotes = this.getNotes(userId);
    const next = userNotes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            ...input,
            id: note.id,
            userId,
            updatedAt: now()
          }
        : note
    );
    notes.set(userId, next);
    return persist(next.find((note) => note.id === noteId));
  },

  deleteNote(userId: string, noteId: string) {
    notes.set(
      userId,
      this.getNotes(userId).filter((note) => note.id !== noteId)
    );
    persist(undefined);
  },

  getCalendarEvents(userId: string): CalendarEvent[] {
    const user = users.get(userId);
    const taskEvents = this.getTasks(userId).map<CalendarEvent>((task) => ({
      id: `cal_task_${task.id}`,
      date: task.dueDate,
      label: task.title,
      type:
        task.category === "Revision"
          ? "Revision"
          : task.category === "Mock Tests"
            ? "Mock"
            : task.category === "Projects"
              ? "Project"
              : "Task",
      sourceId: task.id
    }));

    const revisionEvents = flattenRoadmap(this.getRoadmap(userId))
      .filter((item) => item.nextRevision)
      .map<CalendarEvent>((item) => ({
        id: `cal_revision_${item.id}`,
        date: item.nextRevision!,
        label: `Revise ${item.title}`,
        type: "Revision",
        sourceId: item.id
      }));

    const examEvent: CalendarEvent[] = user?.profile.examDate
      ? [
          {
            id: `cal_exam_${user.id}`,
            date: user.profile.examDate,
            label: user.profile.examName || user.profile.targetJob || "Target date",
            type: "Exam"
          }
        ]
      : [];

    return [...taskEvents, ...revisionEvents, ...examEvent].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  },

  getCommunityPosts() {
    return communityPosts;
  },

  getUsers() {
    return [...users.values()];
  }
};

function buildStarterTasks(
  userId: string,
  profile: UserProfile,
  roadmap: RoadmapNode[]
): StudyTask[] {
  const focus = profile.targetJob ?? profile.examName ?? "Core preparation";
  const nextTopics = nextBestTopics(roadmap, 3);
  const titles = [
    nextTopics[0]?.title
      ? `Study ${nextTopics[0].title}`
      : `Map syllabus gaps for ${focus}`,
    nextTopics[1]?.title
      ? `Practice questions for ${nextTopics[1].title}`
      : "Complete one focused Pomodoro block",
    nextTopics[2]?.title
      ? `Create revision notes for ${nextTopics[2].title}`
      : "Schedule first spaced revision"
  ];

  return [
    {
      id: id("task"),
      userId,
      title: titles[0],
      category: "Study",
      priority: "high",
      status: "not-started",
      dueDate: todayPlus(0),
      estimatedMinutes: 60,
      order: 1
    },
    {
      id: id("task"),
      userId,
      title: titles[1],
      category: "Mock Tests",
      priority: "medium",
      status: "not-started",
      dueDate: todayPlus(1),
      estimatedMinutes: 75,
      order: 2
    },
    {
      id: id("task"),
      userId,
      title: titles[2],
      category: "Revision",
      priority: "medium",
      status: "not-started",
      dueDate: todayPlus(2),
      estimatedMinutes: 35,
      order: 3
    }
  ];
}

function getAllTopics(roadmap: RoadmapNode[]) {
  return flattenRoadmap(roadmap).filter((item) => item.type === "topic");
}
