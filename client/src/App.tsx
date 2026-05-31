import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "./lib/api";
import { AuthPanel } from "./components/AuthPanel";
import { AppShell, ViewName } from "./components/AppShell";
import { LandingPage } from "./components/LandingPage";
import { OnboardingWizard } from "./components/OnboardingWizard";
import {
  DashboardResponse,
  StudyPlan,
  StudyNote,
  StudySession,
  StudyTask,
  TopicStatus,
  User,
  UserProfile
} from "./types";

const tokenKey = "study-help-token";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activeView, setActiveView] = useState<ViewName>("Dashboard");
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("study-help-theme") === "dark";
  });

  const refreshDashboard = useCallback(async () => {
    if (!token) return;
    setError("");
    const response = await api.dashboard(token);
    setDashboard(response);
    setUser(response.user);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    refreshDashboard()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load dashboard.");
        localStorage.removeItem(tokenKey);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [refreshDashboard, token]);

  useEffect(() => {
    localStorage.setItem("study-help-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleAuthSuccess(nextToken: string, nextUser: User) {
    localStorage.setItem(tokenKey, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setAuthMode(null);
    setShowOnboarding(
      !nextUser.profile.dailyStudyHours && nextUser.email !== "demo@studyhelp.local"
    );
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setDashboard(null);
    setActiveView("Dashboard");
  }

  async function submitOnboarding(value: UserProfile & { persona?: User["persona"] }) {
    if (!token) return;
    await api.onboarding(token, value);
    setShowOnboarding(false);
    await refreshDashboard();
  }

  async function updateRoadmap(id: string, status: TopicStatus) {
    if (!token || !dashboard) return;
    const previous = dashboard;
    setDashboard({
      ...dashboard,
      roadmap: updateRoadmapLocal(dashboard.roadmap, id, status)
    });
    try {
      await api.updateRoadmap(token, id, status);
      await refreshDashboard();
    } catch (err) {
      setDashboard(previous);
      setError(err instanceof Error ? err.message : "Could not update roadmap.");
    }
  }

  async function createTask(task: Omit<StudyTask, "id" | "userId" | "order">) {
    if (!token) return;
    await api.createTask(token, task);
    await refreshDashboard();
  }

  async function updateTask(id: string, task: Partial<StudyTask>) {
    if (!token) return;
    await api.updateTask(token, id, task);
    await refreshDashboard();
  }

  async function deleteTask(id: string) {
    if (!token) return;
    await api.deleteTask(token, id);
    await refreshDashboard();
  }

  async function reorderTasks(ids: string[]) {
    if (!token) return;
    await api.reorderTasks(token, ids);
    await refreshDashboard();
  }

  async function createSession(session: Omit<StudySession, "id" | "userId">) {
    if (!token) return;
    await api.createSession(token, session);
    await refreshDashboard();
  }

  async function createNote(
    note: Omit<StudyNote, "id" | "userId" | "createdAt" | "updatedAt">
  ) {
    if (!token) return;
    await api.createNote(token, note);
    await refreshDashboard();
  }

  async function updateNote(id: string, note: Partial<StudyNote>) {
    if (!token) return;
    await api.updateNote(token, id, note);
    await refreshDashboard();
  }

  async function deleteNote(id: string) {
    if (!token) return;
    await api.deleteNote(token, id);
    await refreshDashboard();
  }

  function applyPlan(plan: StudyPlan) {
    if (!dashboard) return;
    setDashboard({ ...dashboard, plan });
  }

  const themedClass = darkMode ? "dark" : "";

  if (!token) {
    return (
      <div className={themedClass}>
        <LandingPage
          onAuth={setAuthMode}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((value) => !value)}
        />
        {authMode && (
          <AuthPanel
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  if (loading || !dashboard || !user) {
    return (
      <div className={`${themedClass} min-h-screen bg-slate-100 dark:bg-slate-950`}>
        <div className="grid min-h-screen place-items-center text-slate-600 dark:text-slate-200">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-sea" />
            <div className="mt-3 text-sm font-bold">Loading Study Help</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={themedClass}>
      {error && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-soft dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}
      <AppShell
        token={token}
        dashboard={dashboard}
        activeView={activeView}
        setActiveView={setActiveView}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onLogout={logout}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onRefresh={refreshDashboard}
        onUpdateRoadmap={updateRoadmap}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onReorderTasks={reorderTasks}
        onCreateSession={createSession}
        onCreateNote={createNote}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
        onPlanGenerated={applyPlan}
      />
      {showOnboarding && (
        <OnboardingWizard
          initial={{ ...user.profile, persona: user.persona }}
          onClose={() => setShowOnboarding(false)}
          onSubmit={submitOnboarding}
        />
      )}
    </div>
  );
}

function updateRoadmapLocal(
  nodes: DashboardResponse["roadmap"],
  id: string,
  status: TopicStatus
): DashboardResponse["roadmap"] {
  return nodes.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        status,
        progress: status === "completed" ? 100 : status === "in-progress" ? 55 : 0
      };
    }
    return {
      ...node,
      children: updateRoadmapLocal(node.children, id, status)
    };
  });
}
