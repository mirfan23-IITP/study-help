import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json({ roadmap: store.getRoadmap(req.user!.id) });
});

router.patch("/:topicId", requireAuth, (req, res) => {
  const body = z
    .object({
      status: z.enum(["not-started", "in-progress", "completed"])
    })
    .parse(req.body);
  res.json({
    roadmap: store.updateTopicStatus(
      req.user!.id,
      String(req.params.topicId),
      body.status
    )
  });
});

export default router;
