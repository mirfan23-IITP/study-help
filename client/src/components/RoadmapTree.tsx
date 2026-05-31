import { ChevronRight, Circle, CircleCheckBig, Clock3 } from "lucide-react";
import { RoadmapNode, TopicStatus } from "../types";
import { Badge, Panel, ProgressBar, cx } from "./Primitives";

const statusLabels: Record<TopicStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed"
};

export function RoadmapTree({
  nodes,
  onStatusChange
}: {
  nodes: RoadmapNode[];
  onStatusChange: (id: string, status: TopicStatus) => void;
}) {
  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="sea">Roadmap Builder</Badge>
          <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
            Subjects to subtopics
          </h2>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-slate-500">
          <span>Auto progress</span>
          <span>Revision-aware</span>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {nodes.map((node) => (
          <RoadmapNodeView
            key={node.id}
            node={node}
            depth={0}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </Panel>
  );
}

function RoadmapNodeView({
  node,
  depth,
  onStatusChange
}: {
  node: RoadmapNode;
  depth: number;
  onStatusChange: (id: string, status: TopicStatus) => void;
}) {
  const Icon =
    node.status === "completed"
      ? CircleCheckBig
      : node.status === "in-progress"
        ? Clock3
        : Circle;

  return (
    <div className={cx(depth > 0 && "ml-3 border-l border-slate-200 pl-3 dark:border-slate-800")}>
      <div
        className={cx(
          "rounded-lg border p-3",
          depth === 0
            ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
            : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Icon
              className={cx(
                "mt-1 h-4 w-4 flex-none",
                node.status === "completed"
                  ? "text-sea"
                  : node.status === "in-progress"
                    ? "text-flame"
                    : "text-slate-400"
              )}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-words font-bold text-slate-900 dark:text-white">
                  {node.title}
                </span>
                <Badge
                  tone={
                    node.status === "completed"
                      ? "sea"
                      : node.status === "in-progress"
                        ? "flame"
                        : "slate"
                  }
                >
                  {statusLabels[node.status]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                <span>{node.type}</span>
                <span>{node.estimatedHours}h</span>
                {node.nextRevision && <span>Revision {node.nextRevision}</span>}
              </div>
            </div>
          </div>
          {node.type === "topic" && (
            <select
              aria-label={`Change status for ${node.title}`}
              value={node.status}
              onChange={(event) =>
                onStatusChange(node.id, event.target.value as TopicStatus)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none ring-sea focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
        <div className="mt-3">
          <ProgressBar value={node.progress} />
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <RoadmapNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
      {depth === 0 && node.children.length > 0 && (
        <div className="ml-4 mt-2 flex items-center gap-1 text-xs font-semibold text-slate-400">
          <ChevronRight className="h-3 w-3" />
          {node.children.length} modules
        </div>
      )}
    </div>
  );
}
