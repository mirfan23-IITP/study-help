import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { generateStudyPlan } from "../services/ai.js";
import { store } from "../services/store.js";

const router = Router();

router.post("/study-plan", requireAuth, async (req, res) => {
  const body = z
    .object({
      availableMinutes: z.coerce.number().min(15).max(720).optional()
    })
    .parse(req.body);
  const user = store.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const plan = await generateStudyPlan({
    user,
    roadmap: store.getRoadmap(user.id),
    tasks: store.getTasks(user.id),
    sessions: store.getSessions(user.id),
    availableMinutes: body.availableMinutes
  });
  res.json({ plan });
});

router.post("/interview-coach", requireAuth, (req, res) => {
  const body = z
    .object({
      role: z.string().default("Software Engineer"),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate")
    })
    .parse(req.body);

  res.json({
    coach: {
      role: body.role,
      difficulty: body.difficulty,
      questions: [
        `Explain a ${body.role} project where you improved a measurable outcome.`,
        "Walk through your approach to debugging a production issue.",
        "Solve a two-pointer coding problem and explain complexity.",
        "Describe a time you handled feedback or conflict."
      ],
      feedbackRubric: [
        "Clarity of problem framing",
        "Depth of technical reasoning",
        "Trade-off awareness",
        "Concise communication"
      ]
    }
  });
});

export default router;
