import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { DashboardResponse } from "../types";
import { Badge, Panel } from "./Primitives";

export function AnalyticsPanel({ dashboard }: { dashboard: DashboardResponse }) {
  const studyData = dashboard.sessions
    .slice()
    .reverse()
    .map((session) => ({
      day: new Date(session.completedAt).toLocaleDateString("en-IN", {
        weekday: "short"
      }),
      minutes: session.focusMinutes,
      subject: session.subject
    }));

  const mockData = dashboard.scores.map((score) => ({
    label: score.label,
    score: Math.round((score.score / score.total) * 100)
  }));

  const pie = [
    { name: "Completed", value: dashboard.metrics.topicsCompleted, color: "#0f766e" },
    { name: "Remaining", value: dashboard.metrics.remainingTopics, color: "#f97316" }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2">
        <Badge tone="sea">Progress Analytics</Badge>
        <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
          Study hours and consistency
        </h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={studyData}>
              <defs>
                <linearGradient id="studyFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#0f766e"
                strokeWidth={3}
                fill="url(#studyFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <Badge tone="flame">Completion Rate</Badge>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} innerRadius={62} outerRadius={90} dataKey="value">
                {pie.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-4xl font-black">
          {dashboard.metrics.completionRate}%
        </div>
      </Panel>

      <Panel className="xl:col-span-3">
        <Badge tone="cobalt">Mock Test Tracker</Badge>
        <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">
          Score trajectory
        </h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
