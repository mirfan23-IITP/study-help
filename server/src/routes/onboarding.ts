import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

router.post("/", requireAuth, (req, res) => {
  const body = z
    .object({
      persona: z
        .enum(["government", "college", "job-seeker", "self-learner"])
        .optional(),
      examName: z.string().optional(),
      targetJob: z.string().optional(),
      collegeDegree: z.string().optional(),
      branch: z.string().optional(),
      examDate: z.string().optional(),
      dailyStudyHours: z.coerce.number().min(1).max(16).optional(),
      currentSkillLevel: z
        .enum(["beginner", "intermediate", "advanced"])
        .optional()
    })
    .parse(req.body);

  const { persona, ...profile } = body;
  const user = store.updateProfile(req.user!.id, profile, persona);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  res.json({
    user,
    roadmap: store.getRoadmap(req.user!.id),
    tasks: store.getTasks(req.user!.id)
  });
});

export default router;
