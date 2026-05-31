import { FormEvent, useState } from "react";
import { GraduationCap, Loader2, X } from "lucide-react";
import { api } from "../lib/api";
import { Persona, User } from "../types";
import { Badge, PrimaryButton, SecondaryButton } from "./Primitives";

export function AuthPanel({
  mode,
  onClose,
  onSuccess
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onSuccess: (token: string, user: User) => void;
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "Demo Student",
    email: "demo@studyhelp.local",
    password: "password123",
    persona: "job-seeker" as Persona
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response =
        currentMode === "login"
          ? await api.login(form.email, form.password)
          : await api.signup(form);
      onSuccess(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin() {
    setLoading(true);
    setError("");
    try {
      const response = await api.login("demo@studyhelp.local", "password123");
      onSuccess(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <Badge tone="sea">{currentMode === "login" ? "Welcome back" : "Create account"}</Badge>
            <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
              {currentMode === "login" ? "Login to Study Help" : "Start your roadmap"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            title="Close"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {currentMode === "signup" && (
            <label className="block text-sm font-semibold">
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((value) => ({ ...value, name: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-sea transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          )}

          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((value) => ({ ...value, email: event.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-sea transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((value) => ({ ...value, password: event.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-sea transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          {currentMode === "signup" && (
            <label className="block text-sm font-semibold">
              Preparation type
              <select
                value={form.persona}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    persona: event.target.value as Persona
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-sea transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="government">Government Exam Aspirant</option>
                <option value="college">College Student</option>
                <option value="job-seeker">Job Seeker</option>
                <option value="self-learner">Self Learner</option>
              </select>
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </div>
          )}

          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
            {currentMode === "login" ? "Login" : "Create Account"}
          </PrimaryButton>
        </form>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <SecondaryButton onClick={demoLogin} className="w-full">
            Try Demo
          </SecondaryButton>
          <SecondaryButton
            onClick={() =>
              setCurrentMode(currentMode === "login" ? "signup" : "login")
            }
            className="w-full"
          >
            {currentMode === "login" ? "Sign Up" : "Use Login"}
          </SecondaryButton>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Google login and email verification endpoints are wired in the API.
          Add credentials in production to enable them.
        </p>
      </div>
    </div>
  );
}
