import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json({ events: store.getCalendarEvents(req.user!.id) });
});

export default router;
