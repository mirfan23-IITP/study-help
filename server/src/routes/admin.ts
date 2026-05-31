import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

router.get("/overview", requireAuth, (_req, res) => {
  const users = store.getUsers();
  res.json({
    users: users.length,
    communities: ["UPSC", "GATE", "SSC", "Data Science", "Software Engineering"],
    reports: 0,
    premiumConversion: 18,
    activeToday: Math.max(1, Math.round(users.length * 0.72))
  });
});

router.get("/community-posts", requireAuth, (_req, res) => {
  res.json({ posts: store.getCommunityPosts() });
});

export default router;
