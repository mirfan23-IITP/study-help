import { FormEvent, useState } from "react";
import { WandSparkles, X } from "lucide-react";
import { Persona, UserProfile } from "../types";
import { Badge, PrimaryButton, SecondaryButton } from "./Primitives";

const presets = [
  "UPSC",
  "SSC",
  "Railway",
  "Banking",
  "GATE",
  "CAT",
  "Data Science",
  "Software Engineering",
  "AI/ML",
  "Placement Preparation"
];

export function OnboardingWizard({
  initial,
  onClose,
  onSubmit
}: {
  initial?: UserProfile & { persona?: Persona };
  onClose: () => void;
  onSubmit: (value: UserProfile & { persona?: Persona }) => Promise<void>;
}) {
  const [form, setForm] = useState<UserProfile & { persona?: Persona }>({
    persona: initial?.persona ?? "job-seeker",
    examName: initial?.examName ?? "GATE",
    targetJob: initial?.targetJob ?? "Data Scientist",
    collegeDegree: initial?.collegeDegree ?? "B.Tech",
    branch: initial?.branch ?? "Computer Science",
    examDate: initial?.examDate ?? "2027-02-07",
    dailyStudyHours: initial?.dailyStudyHours ?? 4,
    currentSkillLevel: initial?.currentSkillLevel ?? "intermediate"
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur">
      <form
        onSubmit={submit}
        className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="cobalt">Onboarding</Badge>
            <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
              Generate your personalized roadmap
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close onboarding"
            title="Close"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() =>
                setForm((value) =>
                  preset.includes("Data") ||
                  preset.includes("Software") ||
                  preset.includes("AI") ||
                  preset.includes("Placement")
                    ? { ...value, targetJob: preset, persona: "job-seeker" }
                    : { ...value, examName: preset, persona: "government" }
                )
              }
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sea hover:text-sea dark:border-slate-700 dark:text-slate-300"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Exam name">
            <input
              value={form.examName ?? ""}
              onChange={(event) =>
                setForm((value) => ({ ...value, examName: event.target.value }))
              }
              className="field"
            />
          </Field>
          <Field label="Target job">
            <input
              value={form.targetJob ?? ""}
              onChange={(event) =>
                setForm((value) => ({ ...value, targetJob: event.target.value }))
              }
              className="field"
            />
          </Field>
          <Field label="College degree">
            <input
              value={form.collegeDegree ?? ""}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  collegeDegree: event.target.value
                }))
              }
              className="field"
            />
          </Field>
          <Field label="Branch">
            <input
              value={form.branch ?? ""}
              onChange={(event) =>
                setForm((value) => ({ ...value, branch: event.target.value }))
              }
              className="field"
            />
          </Field>
          <Field label="Exam date">
            <input
              type="date"
              value={form.examDate ?? ""}
              onChange={(event) =>
                setForm((value) => ({ ...value, examDate: event.target.value }))
              }
              className="field"
            />
          </Field>
          <Field label="Daily study hours">
            <input
              type="number"
              min={1}
              max={16}
              value={form.dailyStudyHours ?? 4}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  dailyStudyHours: Number(event.target.value)
                }))
              }
              className="field"
            />
          </Field>
          <Field label="Current skill level">
            <select
              value={form.currentSkillLevel ?? "intermediate"}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  currentSkillLevel: event.target.value as UserProfile["currentSkillLevel"]
                }))
              }
              className="field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Preparation type">
            <select
              value={form.persona ?? "job-seeker"}
              onChange={(event) =>
                setForm((value) => ({
                  ...value,
                  persona: event.target.value as Persona
                }))
              }
              className="field"
            >
              <option value="government">Government Exam Aspirant</option>
              <option value="college">College Student</option>
              <option value="job-seeker">Job Seeker</option>
              <option value="self-learner">Self Learner</option>
            </select>
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton type="submit" disabled={saving}>
            <WandSparkles className="h-4 w-4" />
            {saving ? "Generating..." : "Generate Roadmap"}
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
