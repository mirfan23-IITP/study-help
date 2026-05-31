import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { buildRevisionDates } from "../services/planner.js";
import { store } from "../services/store.js";

const router = Router();

router.post("/sessions", requireAuth, (req, res) => {
  const body = z
    .object({
      mode: z.enum(["25/5", "50/10", "custom"]),
      focusMinutes: z.coerce.number().min(1).max(240),
      breakMinutes: z.coerce.number().min(0).max(60),
      completedAt: z.string().default(() => new Date().toISOString()),
      subject: z.string().min(2)
    })
    .parse(req.body);

  const session = store.addSession(req.user!.id, body);
  res.status(201).json({ session });
});

router.get("/sessions", requireAuth, (req, res) => {
  res.json({ sessions: store.getSessions(req.user!.id) });
});

router.get("/revision-schedule", requireAuth, (_req, res) => {
  res.json({
    cadence: [1, 3, 7, 15, 30, 60],
    dates: buildRevisionDates()
  });
});

export default router;
