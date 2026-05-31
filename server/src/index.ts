import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { config } from "./config.js";
import { checkDatabase } from "./db/pool.js";
import adminRouter from "./routes/admin.js";
import aiRouter from "./routes/ai.js";
import authRouter from "./routes/auth.js";
import calendarRouter from "./routes/calendar.js";
import dashboardRouter from "./routes/dashboard.js";
import onboardingRouter from "./routes/onboarding.js";
import notesRouter from "./routes/notes.js";
import roadmapRouter from "./routes/roadmap.js";
import studyRouter from "./routes/study.js";
import tasksRouter from "./routes/tasks.js";

const app = express();
const allowedOrigins = new Set([
  config.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "study-help-api",
    database: await checkDatabase()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/notes", notesRouter);
app.use("/api/study", studyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/admin", adminRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

app.listen(config.port, () => {
  console.log(`Study Help API running on http://localhost:${config.port}`);
});
