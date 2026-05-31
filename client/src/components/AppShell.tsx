import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  FileText,
  Gauge,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  NotebookTabs,
  RefreshCcw,
  Rocket,
  Route,
  Settings,
  Sparkles,
  Sun,
  TimerReset,
  Trophy,
  UsersRound,
  X
} from "lucide-react";
import { api } from "../lib/api";
import {
  DashboardResponse,
  StudyNote,
  StudyPlan,
  StudySession,
  StudyTask,
  TopicStatus
} from "../types";
import { navItems } from "../data/content";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { DailyPlanner } from "./DailyPlanner";
import { PomodoroTimer } from "./PomodoroTimer";
import {
  Badge,
  IconButton,
  Panel,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  cx
} from "./Primitives";
import { RoadmapTree } from "./RoadmapTree";

export type ViewName = (typeof navItems)[number];

const navIcons: Record<ViewName, typeof Home> = {
  Dashboard: LayoutDashboard,
  Roadmap: Route,
  Planner: ClipboardList,
  Sessions: TimerReset,
  Analytics: Gauge,
  Calendar: CalendarDays,
  Notes: NotebookTabs,
  Career: Rocket,
  Community: UsersRound,
  Admin: Settings
};

export function AppShell({
  token,
  dashboard,
  activeView,
  setActiveView,
  darkMode,
  onToggleTheme,
  onLogout,
  onOpenOnboarding,
  onRefresh,
  onUpdateRoadmap,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  onCreateSession,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onPlanGenerated
}: {
  token: string;
  dashboard: DashboardResponse;
  activeView: ViewName;
  setActiveView: (view: ViewName) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenOnboarding: () => void;
  onRefresh: () => Promise<void>;
  onUpdateRoadmap: (id: string, status: TopicStatus) => Promise<void>;
  onCreateTask: (task: Omit<StudyTask, "id" | "userId" | "order">) => Promise<void>;
  onUpdateTask: (id: string, task: Partial<StudyTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onReorderTasks: (ids: string[]) => Promise<void>;
  onCreateSession: (session: Omit<StudySession, "id" | "userId">) => Promise<void>;
  onCreateNote: (
    note: Omit<StudyNote, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onUpdateNote: (id: string, note: Partial<StudyNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onPlanGenerated: (plan: StudyPlan) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const view = useMemo(() => {
    switch (activeView) {
      case "Dashboard":
        return (
          <DashboardHome
            token={token}
            dashboard={dashboard}
            onPlanGenerated={onPlanGenerated}
            onOpenOnboarding={onOpenOnboarding}
          />
        );
      case "Roadmap":
        return (
          <RoadmapTree
            nodes={dashboard.roadmap}
            onStatusChange={onUpdateRoadmap}
          />
        );
      case "Planner":
        return (
          <DailyPlanner
            tasks={dashboard.tasks}
            onCreate={onCreateTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onReorder={onReorderTasks}
          />
        );
      case "Sessions":
        return <PomodoroTimer onSave={onCreateSession} />;
      case "Analytics":
        return <AnalyticsPanel dashboard={dashboard} />;
      case "Calendar":
        return <CalendarPanel dashboard={dashboard} />;
      case "Notes":
        return (
          <NotesPanel
            notes={dashboard.notes}
            onCreate={onCreateNote}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
          />
        );
      case "Career":
        return <CareerPanel dashboard={dashboard} token={token} />;
      case "Community":
        return <CommunityPanel token={token} />;
      case "Admin":
        return <AdminPanel token={token} />;
      default:
        return null;
    }
  }, [
    activeView,
    dashboard,
    onCreateSession,
    onCreateTask,
    onDeleteTask,
    onCreateNote,
    onOpenOnboarding,
    onPlanGenerated,
    onReorderTasks,
    onUpdateNote,
    onUpdateRoadmap,
    onUpdateTask,
    onDeleteNote,
    token
  ]);

  return (
    <div className="min-h-screen bg-slate-100 text-ink dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              title="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 lg:hidden dark:border-slate-700"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black">Study Help</div>
              <div className="text-xs font-semibold text-slate-500">
                {dashboard.user.profile.targetJob ??
                  dashboard.user.profile.examName ??
                  "Preparation workspace"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              label="Refresh dashboard"
              icon={RefreshCcw}
              onClick={onRefresh}
            />
            <IconButton
              label={darkMode ? "Light mode" : "Dark mode"}
              icon={darkMode ? Sun : Moon}
              onClick={onToggleTheme}
            />
            <IconButton label="Logout" icon={LogOut} onClick={onLogout} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] lg:grid-cols-[280px_1fr]">
        <aside
          className={cx(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-4 transition lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-64px)] lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="font-black">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              title="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm font-bold">{dashboard.user.name}</div>
            <div className="mt-1 break-all text-xs text-slate-500">
              {dashboard.user.email}
            </div>
            <div className="mt-4">
              <ProgressBar value={dashboard.metrics.completionRate} />
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500">
              {dashboard.metrics.completionRate}% roadmap complete
            </div>
          </div>

          <nav className="mt-4 grid gap-1">
            {navItems.map((item) => {
              const Icon = navIcons[item];
              const active = activeView === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setActiveView(item);
                    setSidebarOpen(false);
                  }}
                  className={cx(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition",
                    active
                      ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onOpenOnboarding}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left text-sm font-bold transition hover:border-sea dark:border-slate-800 dark:bg-slate-900"
          >
            Rebuild roadmap
            <ChevronRight className="h-4 w-4" />
          </button>
        </aside>

        <main className="min-w-0 p-4 lg:p-6">{view}</main>
      </div>
    </div>
  );
}

function DashboardHome({
  token,
  dashboard,
  onPlanGenerated,
  onOpenOnboarding
}: {
  token: string;
  dashboard: DashboardResponse;
  onPlanGenerated: (plan: StudyPlan) => void;
  onOpenOnboarding: () => void;
}) {
  const [minutes, setMinutes] = useState((dashboard.metrics.dailyGoal ?? 3) * 60);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [notificationState, setNotificationState] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  async function requestPlan() {
    setLoadingPlan(true);
    try {
      const response = await api.studyPlan(token, minutes);
      onPlanGenerated(response.plan);
    } finally {
      setLoadingPlan(false);
    }
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setNotificationState("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationState(permission);
    if (permission === "granted") {
      new Notification("Study Help", {
        body: "Revision reminders and study nudges are enabled."
      });
    }
  }

  const metrics = [
    {
      label: "Daily Goal",
      value: `${dashboard.metrics.dailyGoal}h`,
      icon: ClipboardList,
      tone: "text-sea"
    },
    {
      label: "Study Streak",
      value: `${dashboard.metrics.streak}d`,
      icon: Trophy,
      tone: "text-flame"
    },
    {
      label: "Hours Studied",
      value: `${dashboard.metrics.hoursStudied}h`,
      icon: TimerReset,
      tone: "text-cobalt"
    },
    {
      label: "Tasks Done",
      value: `${dashboard.metrics.tasksCompleted}/${dashboard.metrics.totalTasks}`,
      icon: CheckCircle2,
      tone: "text-sea"
    },
    {
      label: "Exam Countdown",
      value:
        dashboard.metrics.examCountdown === null
          ? "Set date"
          : `${dashboard.metrics.examCountdown}d`,
      icon: CalendarDays,
      tone: "text-berry"
    }
  ];
  const reminders = [
    dashboard.metrics.tasksDueToday > 0
      ? `${dashboard.metrics.tasksDueToday} task${dashboard.metrics.tasksDueToday > 1 ? "s" : ""} due today`
      : "No pending tasks due today",
    dashboard.metrics.upcomingRevisions[0]
      ? `Revise ${dashboard.metrics.upcomingRevisions[0].title}`
      : "Complete a topic to unlock revision reminders",
    dashboard.tasks.find((task) => task.category === "Mock Tests" && task.status !== "completed")
      ?.title ?? "No mock test pending",
    dashboard.metrics.examCountdown === null
      ? "Set an exam or target date"
      : `${dashboard.metrics.examCountdown} days until target date`
  ];
  const achievements = [
    {
      label: `${dashboard.metrics.streak} day streak`,
      icon: Trophy,
      tone: "text-flame"
    },
    {
      label: `${dashboard.metrics.tasksCompleted} tasks completed`,
      icon: CheckCircle2,
      tone: "text-sea"
    },
    {
      label: `${dashboard.notes.length} saved notes`,
      icon: NotebookTabs,
      tone: "text-cobalt"
    }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <Badge tone="sea">Smart Dashboard</Badge>
            <h1 className="mt-3 text-3xl font-black text-ink dark:text-white sm:text-4xl">
              Good to see you, {dashboard.user.name.split(" ")[0]}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Your next study block is selected from active topics, revision
              pressure, pending tasks, and available time.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={requestPlan} disabled={loadingPlan}>
                <Bot className="h-4 w-4" />
                {loadingPlan ? "Planning..." : "What Should I Study Next?"}
              </PrimaryButton>
              <SecondaryButton onClick={onOpenOnboarding}>
                <GraduationCap className="h-4 w-4" />
                Update Goal
              </SecondaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">AI readiness</div>
                <div className="mt-1 text-xs text-slate-500">
                  {dashboard.metrics.performance.insight}
                </div>
              </div>
              <div className="text-4xl font-black">
                {dashboard.metrics.performance.readiness}
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={dashboard.metrics.performance.readiness} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                <div className="text-xs font-semibold text-slate-500">
                  Success probability
                </div>
                <div className="mt-1 text-xl font-black">
                  {dashboard.metrics.performance.successProbability}%
                </div>
              </div>
              <label className="rounded-lg bg-white p-3 text-xs font-semibold text-slate-500 dark:bg-slate-900">
                Available time
                <input
                  type="range"
                  min={30}
                  max={420}
                  step={15}
                  value={minutes}
                  onChange={(event) => setMinutes(Number(event.target.value))}
                  className="mt-3 w-full accent-teal-700"
                />
                <span className="mt-1 block text-slate-900 dark:text-white">
                  {minutes} min
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Panel key={metric.label}>
            <metric.icon className={`h-5 w-5 ${metric.tone}`} />
            <div className="mt-4 text-3xl font-black">{metric.value}</div>
            <div className="mt-1 text-sm font-semibold text-slate-500">
              {metric.label}
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel>
          <Badge tone="cobalt">AI Study Planner</Badge>
          <h2 className="mt-3 text-2xl font-black">{dashboard.plan.headline}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {dashboard.plan.reason}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {dashboard.plan.dailyPlan.map((block) => (
              <article key={block.block} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-bold uppercase text-slate-500">
                  {block.block}
                </div>
                <div className="mt-2 text-2xl font-black">{block.minutes}m</div>
                <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {block.activity}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm font-bold">Monthly focus</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {dashboard.plan.monthlyPlan.map((item) => (
                <div key={item} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-sea" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <Badge tone="flame">Reminders</Badge>
          <div className="mt-4 space-y-3">
            {reminders.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold dark:border-slate-800"
              >
                {item}
                <BellRing className="h-4 w-4 text-sea" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={enableNotifications}
              className="rounded-lg border border-slate-200 px-3 py-3 text-left text-sm font-bold hover:border-sea dark:border-slate-800"
            >
              Browser push
              <span className="mt-1 block text-xs text-slate-500">
                {notificationState}
              </span>
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-3 text-left text-sm font-bold hover:border-sea dark:border-slate-800"
            >
              Email nudges
              <span className="mt-1 block text-xs text-slate-500">
                SMTP-ready
              </span>
            </button>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <Badge tone="sea">Next Topics</Badge>
          <div className="mt-4 space-y-3">
            {dashboard.nextTopics.map((topic) => (
              <div key={topic.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="font-bold">{topic.title}</div>
                <div className="mt-2">
                  <ProgressBar value={topic.progress} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <Badge tone="cobalt">Revision Queue</Badge>
          <div className="mt-4 space-y-3">
            {dashboard.metrics.upcomingRevisions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Complete a topic to generate Day 1, 3, 7, 15, 30, and 60 revisions.
              </p>
            ) : (
              dashboard.metrics.upcomingRevisions.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="font-bold">{item.title}</div>
                  <div className="mt-1 text-slate-500">Next: {item.nextRevision}</div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <Badge tone="flame">Gamification</Badge>
          <div className="mt-4 text-4xl font-black">{dashboard.metrics.xp} XP</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">
            Level: {dashboard.metrics.level}
          </div>
          <div className="mt-4">
            <ProgressBar value={dashboard.metrics.taskCompletionRate} />
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            {dashboard.metrics.taskCompletionRate}% task completion
          </div>
          <div className="mt-4 space-y-3">
            {achievements.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-bold dark:border-slate-800">
                <item.icon className={`h-4 w-4 ${item.tone}`} />
                {item.label}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CalendarPanel({ dashboard }: { dashboard: DashboardResponse }) {
  const events = dashboard.calendarEvents;

  return (
    <Panel>
      <Badge tone="cobalt">Calendar System</Badge>
      <h2 className="mt-3 text-2xl font-black">Tasks, revisions, exams, and deadlines</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm font-semibold text-slate-500 dark:border-slate-700">
            Add a task, complete a roadmap topic, or set an exam date to populate the calendar.
          </div>
        ) : events.map((event) => (
          <article key={`${event.date}-${event.label}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs font-bold uppercase text-slate-500">
              {event.type}
            </div>
            <div className="mt-2 text-lg font-black">{event.date}</div>
            <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
              {event.label}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        Google Calendar sync is represented in the API/deployment plan and can be connected with OAuth credentials.
      </div>
    </Panel>
  );
}

function NotesPanel({
  notes,
  onCreate,
  onUpdate,
  onDelete
}: {
  notes: StudyNote[];
  onCreate: (
    note: Omit<StudyNote, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onUpdate: (id: string, note: Partial<StudyNote>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    type: "Note" as StudyNote["type"],
    subject: "General",
    body: "",
    url: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function saveNote() {
    if (!form.title.trim() || !form.body.trim()) return;
    await onCreate({
      title: form.title.trim(),
      type: form.type,
      subject: form.subject.trim() || "General",
      body: form.body.trim(),
      url: form.url.trim() || undefined
    });
    setForm({
      title: "",
      type: "Note",
      subject: "General",
      body: "",
      url: ""
    });
  }

  return (
    <Panel>
      <Badge tone="sea">Notes System</Badge>
      <h2 className="mt-3 text-2xl font-black">Notes, PDFs, links, and YouTube resources</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_140px_150px]">
        <input
          aria-label="Note title"
          value={form.title}
          onChange={(event) =>
            setForm((value) => ({ ...value, title: event.target.value }))
          }
          placeholder="Resource title"
          className="field"
        />
        <select
          aria-label="Note type"
          value={form.type}
          onChange={(event) =>
            setForm((value) => ({
              ...value,
              type: event.target.value as StudyNote["type"]
            }))
          }
          className="field"
        >
          <option value="Note">Note</option>
          <option value="PDF">PDF</option>
          <option value="Link">Link</option>
          <option value="YouTube">YouTube</option>
        </select>
        <input
          aria-label="Note subject"
          value={form.subject}
          onChange={(event) =>
            setForm((value) => ({ ...value, subject: event.target.value }))
          }
          placeholder="Subject"
          className="field"
        />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_180px]">
        <textarea
          aria-label="Note body"
          value={form.body}
          onChange={(event) =>
            setForm((value) => ({ ...value, body: event.target.value }))
          }
          placeholder="Summary, note, or resource details"
          className="field min-h-24 resize-y"
        />
        <div className="grid content-start gap-3">
          <input
            aria-label="Note URL"
            value={form.url}
            onChange={(event) =>
              setForm((value) => ({ ...value, url: event.target.value }))
            }
            placeholder="Optional URL"
            className="field"
          />
          <PrimaryButton
            onClick={saveNote}
            disabled={!form.title.trim() || !form.body.trim()}
          >
            <FileText className="h-4 w-4" /> Save
          </PrimaryButton>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <article key={`${note.title}-${note.type}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <Badge tone={note.type === "PDF" ? "berry" : note.type === "YouTube" ? "flame" : "cobalt"}>
              {note.type}
            </Badge>
            <h3 className="mt-3 break-words font-black">{note.title}</h3>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {note.subject}
            </div>
            {editingId === note.id ? (
              <textarea
                aria-label={`Edit note ${note.title}`}
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="field mt-3 min-h-28 resize-y"
              />
            ) : (
              <p className="mt-3 overflow-hidden text-ellipsis text-sm leading-6 text-slate-600 dark:text-slate-300">
                {note.body}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {editingId === note.id ? (
                <PrimaryButton
                  onClick={async () => {
                    await onUpdate(note.id, { body: editText });
                    setEditingId(null);
                    setEditText("");
                  }}
                >
                  Save Edit
                </PrimaryButton>
              ) : (
                <SecondaryButton
                  onClick={() => {
                    setEditingId(note.id);
                    setEditText(note.body);
                  }}
                >
                  <Edit3 className="h-4 w-4" /> Edit
                </SecondaryButton>
              )}
              <SecondaryButton onClick={() => onDelete(note.id)}>
                <X className="h-4 w-4" /> Delete
              </SecondaryButton>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function CareerPanel({
  dashboard,
  token
}: {
  dashboard: DashboardResponse;
  token: string;
}) {
  const [questions, setQuestions] = useState<string[]>([]);

  async function generateQuestions() {
    const response = await api.interviewCoach(
      token,
      dashboard.user.profile.targetJob ?? "Software Engineer"
    );
    setQuestions(response.coach.questions);
  }

  const tracks = flattenRoadmapNodes(dashboard.roadmap)
    .filter((item) => item.type === "module" || item.type === "topic")
    .slice(0, 10)
    .map((item) => [item.title, item.progress] as const);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <Panel>
        <Badge tone="cobalt">Career Preparation Mode</Badge>
        <h2 className="mt-3 text-2xl font-black">Career readiness score</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {tracks.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex justify-between text-sm font-bold">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="mt-3">
                <ProgressBar value={Number(value)} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <Badge tone="flame">AI Interview Coach</Badge>
        <h2 className="mt-3 text-2xl font-black">Mock interview prompts</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Generate coding, behavioral, and project-depth questions for your current target role.
        </p>
        <PrimaryButton onClick={generateQuestions} className="mt-5">
          <Bot className="h-4 w-4" /> Generate Questions
        </PrimaryButton>
        <div className="mt-5 space-y-3">
          {(questions.length ? questions : [
            "Explain one project that proves your readiness.",
            "Describe a debugging decision with trade-offs.",
            "Solve a medium DSA prompt under time pressure."
          ]).map((question) => (
            <div key={question} className="rounded-lg border border-slate-200 p-3 text-sm font-semibold dark:border-slate-800">
              {question}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function flattenRoadmapNodes(nodes: DashboardResponse["roadmap"]): DashboardResponse["roadmap"] {
  return nodes.flatMap((node) => [node, ...flattenRoadmapNodes(node.children)]);
}

function CommunityPanel({ token }: { token: string }) {
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      group: string;
      author: string;
      title: string;
      replies: number;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    api.communityPosts(token).then((response) => setPosts(response.posts));
  }, [token]);

  return (
    <Panel>
      <Badge tone="sea">Community Section</Badge>
      <h2 className="mt-3 text-2xl font-black">Groups, questions, and shared notes</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <Badge tone={post.group === "GATE" ? "cobalt" : post.group === "SSC" ? "flame" : "sea"}>
              {post.group}
            </Badge>
            <h3 className="mt-3 font-black">{post.title}</h3>
            <div className="mt-3 flex justify-between text-sm text-slate-500">
              <span>{post.author}</span>
              <span>{post.replies} replies</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function AdminPanel({ token }: { token: string }) {
  const [overview, setOverview] = useState<{
    users: number;
    communities: string[];
    reports: number;
    premiumConversion: number;
    activeToday: number;
  } | null>(null);

  useEffect(() => {
    api.admin(token).then(setOverview);
  }, [token]);

  if (!overview) return <Panel>Loading admin analytics...</Panel>;

  return (
    <Panel>
      <Badge tone="berry">Admin Panel</Badge>
      <h2 className="mt-3 text-2xl font-black">Users, content, reports, and analytics</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Users", overview.users],
          ["Active today", overview.activeToday],
          ["Reports", overview.reports],
          ["Premium conversion", `${overview.premiumConversion}%`]
        ].map(([label, value]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black">{value}</div>
          </article>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {overview.communities.map((community) => (
          <Badge key={community} tone="cobalt">
            {community}
          </Badge>
        ))}
      </div>
    </Panel>
  );
}
