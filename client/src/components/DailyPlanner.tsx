import { FormEvent, useMemo, useState } from "react";
import { Edit3, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { StudyTask, TaskCategory } from "../types";
import { Badge, IconButton, Panel, PrimaryButton, cx } from "./Primitives";

const categories: TaskCategory[] = [
  "Study",
  "Revision",
  "Mock Tests",
  "Projects",
  "Interview Practice"
];

export function DailyPlanner({
  tasks,
  onCreate,
  onUpdate,
  onDelete,
  onReorder
}: {
  tasks: StudyTask[];
  onCreate: (task: Omit<StudyTask, "id" | "userId" | "order">) => Promise<void>;
  onUpdate: (id: string, task: Partial<StudyTask>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Study" as TaskCategory,
    priority: "medium" as StudyTask["priority"],
    dueDate: new Date().toISOString().slice(0, 10),
    estimatedMinutes: 50
  });

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        tasks: tasks.filter((task) => task.category === category)
      })),
    [tasks]
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    await onCreate({ ...form, status: "not-started" });
    setForm((value) => ({ ...value, title: "" }));
  }

  async function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const dragged = tasks.find((task) => task.id === dragId);
    const target = tasks.find((task) => task.id === targetId);
    if (dragged && target && dragged.category !== target.category) {
      await onUpdate(dragId, { category: target.category });
    }
    const current = tasks.map((task) => task.id);
    const from = current.indexOf(dragId);
    const to = current.indexOf(targetId);
    const next = [...current];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setDragId(null);
    await onReorder(next);
  }

  async function dropOnColumn(category: TaskCategory) {
    if (!dragId) return;
    const dragged = tasks.find((task) => task.id === dragId);
    if (!dragged) return;
    setDragId(null);
    if (dragged.category !== category) {
      await onUpdate(dragId, { category });
      return;
    }
    const idsWithoutDragged = tasks
      .filter((task) => task.id !== dragId)
      .map((task) => task.id);
    await onReorder([...idsWithoutDragged, dragId]);
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="flame">Daily Planner</Badge>
          <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
            Tasks, priorities, and drag ordering
          </h2>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-3 lg:grid-cols-[1fr_150px_130px_130px_100px]">
        <input
          aria-label="Task title"
          value={form.title}
          onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
          placeholder="Add a task"
          className="field"
        />
        <select
          aria-label="Task category"
          value={form.category}
          onChange={(event) =>
            setForm((value) => ({ ...value, category: event.target.value as TaskCategory }))
          }
          className="field"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          aria-label="Task priority"
          value={form.priority}
          onChange={(event) =>
            setForm((value) => ({
              ...value,
              priority: event.target.value as StudyTask["priority"]
            }))
          }
          className="field"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          aria-label="Task due date"
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm((value) => ({ ...value, dueDate: event.target.value }))}
          className="field"
        />
        <PrimaryButton type="submit">
          <Plus className="h-4 w-4" /> Add
        </PrimaryButton>
      </form>

      <div className="mt-6 overflow-x-auto pb-3">
        <div className="flex min-w-max gap-4">
        {grouped.map((column) => (
          <section
            key={column.category}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOnColumn(column.category)}
            className={cx(
              "min-h-80 w-72 flex-none rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950 sm:w-80",
              dragId && "ring-1 ring-slate-200 dark:ring-slate-800"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-black">{column.category}</h3>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-900">
                {column.tasks.length}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {column.tasks.map((task) => (
                <article
                  key={task.id}
                  draggable
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.stopPropagation();
                    dropOn(task.id);
                  }}
                  className={cx(
                    "min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
                    dragId === task.id && "scale-[0.98] opacity-60",
                    dragId && dragId !== task.id && "hover:border-sea"
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <GripVertical className="mt-1 h-4 w-4 flex-none cursor-grab text-slate-400" />
                    <div className="min-w-0 flex-1">
                      {editingId === task.id ? (
                        <input
                          aria-label={`Edit title for ${task.title}`}
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          className="field min-h-9 py-1 text-sm"
                        />
                      ) : (
                        <h4 className="whitespace-normal break-words text-sm font-bold leading-5 [overflow-wrap:anywhere]">
                          {task.title}
                        </h4>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge
                          tone={
                            task.priority === "high"
                              ? "berry"
                              : task.priority === "medium"
                                ? "flame"
                                : "slate"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge tone={task.status === "completed" ? "sea" : "slate"}>
                          {task.estimatedMinutes}m
                        </Badge>
                      </div>
                      <select
                        value={task.status}
                        onChange={(event) =>
                          onUpdate(task.id, {
                            status: event.target.value as StudyTask["status"]
                          })
                        }
                        className="mt-3 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold outline-none ring-sea focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="mt-3 flex gap-2">
                        {editingId === task.id ? (
                          <IconButton
                            label={`Save ${task.title}`}
                            icon={Save}
                            onClick={async () => {
                              if (draftTitle.trim()) {
                                await onUpdate(task.id, { title: draftTitle.trim() });
                              }
                              setEditingId(null);
                              setDraftTitle("");
                            }}
                          />
                        ) : (
                          <IconButton
                            label={`Edit ${task.title}`}
                            icon={Edit3}
                            onClick={() => {
                              setEditingId(task.id);
                              setDraftTitle(task.title);
                            }}
                          />
                        )}
                        <IconButton
                          label={`Delete ${task.title}`}
                          icon={Trash2}
                          onClick={() => onDelete(task.id)}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {column.tasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm font-semibold text-slate-500 dark:border-slate-700">
                  Drop a card here
                </div>
              )}
            </div>
          </section>
        ))}
        </div>
      </div>
    </Panel>
  );
}
