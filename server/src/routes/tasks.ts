import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

const taskBody = z.object({
  title: z.string().min(2),
  category: z.enum([
    "Study",
    "Revision",
    "Mock Tests",
    "Projects",
    "Interview Practice"
  ]),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["not-started", "in-progress", "completed"]),
  dueDate: z.string(),
  estimatedMinutes: z.coerce.number().min(5).max(600)
});

router.get("/", requireAuth, (req, res) => {
  res.json({ tasks: store.getTasks(req.user!.id) });
});

router.post("/", requireAuth, (req, res) => {
  const body = taskBody.parse(req.body);
  const task = store.createTask(req.user!.id, body);
  res.status(201).json({ task });
});

router.patch("/:taskId", requireAuth, (req, res) => {
  const body = taskBody.partial().parse(req.body);
  const task = store.updateTask(req.user!.id, String(req.params.taskId), body);
  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }
  res.json({ task });
});

router.delete("/:taskId", requireAuth, (req, res) => {
  store.deleteTask(req.user!.id, String(req.params.taskId));
  res.status(204).end();
});

router.post("/reorder", requireAuth, (req, res) => {
  const body = z.object({ ids: z.array(z.string()) }).parse(req.body);
  res.json({ tasks: store.reorderTasks(req.user!.id, body.ids) });
});

export default router;
