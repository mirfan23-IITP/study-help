import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Save } from "lucide-react";
import { StudySession } from "../types";
import { Badge, IconButton, Panel, PrimaryButton, ProgressBar } from "./Primitives";

const modes = {
  "25/5": { focus: 25, rest: 5 },
  "50/10": { focus: 50, rest: 10 },
  custom: { focus: 40, rest: 8 }
} as const;

export function PomodoroTimer({
  onSave
}: {
  onSave: (session: Omit<StudySession, "id" | "userId">) => Promise<void>;
}) {
  const [mode, setMode] = useState<keyof typeof modes>("25/5");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [subject, setSubject] = useState("SQL");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    if (mode !== "custom") {
      setFocusMinutes(modes[mode].focus);
      setSecondsLeft(modes[mode].focus * 60);
    }
  }, [mode]);

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  const display = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const progress = 100 - (secondsLeft / (focusMinutes * 60)) * 100;

  async function save() {
    await onSave({
      mode,
      focusMinutes,
      breakMinutes: modes[mode].rest,
      completedAt: new Date().toISOString(),
      subject
    });
  }

  return (
    <Panel>
      <Badge tone="cobalt">Study Session Tracker</Badge>
      <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
        Pomodoro timer
      </h2>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(modes) as Array<keyof typeof modes>).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  mode === item
                    ? "border-sea bg-sea text-white"
                    : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-7xl font-black tabular-nums text-ink dark:text-white">
            {display}
          </div>
          <div className="mt-5">
            <ProgressBar value={progress} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="field mt-2"
              />
            </label>
            <label className="text-sm font-semibold">
              Focus minutes
              <input
                type="number"
                min={1}
                max={240}
                value={focusMinutes}
                onChange={(event) => {
                  const minutes = Number(event.target.value);
                  setMode("custom");
                  setFocusMinutes(minutes);
                  setSecondsLeft(minutes * 60);
                }}
                className="field mt-2"
              />
            </label>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <IconButton
            label={running ? "Pause timer" : "Start timer"}
            icon={running ? Pause : Play}
            onClick={() => setRunning((value) => !value)}
            active={running}
          />
          <IconButton
            label="Reset timer"
            icon={RotateCcw}
            onClick={() => {
              setRunning(false);
              setSecondsLeft(focusMinutes * 60);
            }}
          />
          <PrimaryButton onClick={save}>
            <Save className="h-4 w-4" /> Save Session
          </PrimaryButton>
          <p className="text-sm leading-6 text-slate-500">
            Saved sessions feed daily, weekly, and monthly hour analytics.
          </p>
        </div>
      </div>
    </Panel>
  );
}
