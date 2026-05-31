import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { config } from "../config.js";
import { createToken, requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();
const googleClient = config.googleClientId
  ? new OAuth2Client(config.googleClientId)
  : undefined;

const persona = z.enum(["government", "college", "job-seeker", "self-learner"]);

router.post("/signup", async (req, res) => {
  const body = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      persona
    })
    .parse(req.body);

  const user = await store.createUser(body);
  const token = createToken({ id: user!.id, email: user!.email });
  res.status(201).json({ token, user: sanitizeUser(user!) });
});

router.post("/login", async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(1)
    })
    .parse(req.body);

  const user = await store.validatePassword(body.email, body.password);
  if (!user) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  res.json({
    token: createToken({ id: user.id, email: user.email }),
    user: sanitizeUser(user)
  });
});

router.post("/google", async (req, res) => {
  const body = z
    .object({
      credential: z.string(),
      persona: persona.default("self-learner")
    })
    .parse(req.body);

  if (!googleClient || !config.googleClientId) {
    res.status(503).json({
      message: "Google login is ready, but GOOGLE_CLIENT_ID is not configured."
    });
    return;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: body.credential,
    audience: config.googleClientId
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    res.status(401).json({ message: "Google account did not provide an email." });
    return;
  }

  const user = await store.createUser({
    name: payload.name ?? payload.email.split("@")[0],
    email: payload.email,
    persona: body.persona,
    googleId: payload.sub
  });

  res.json({
    token: createToken({ id: user!.id, email: user!.email }),
    user: sanitizeUser(user!)
  });
});

router.post("/forgot-password", (req, res) => {
  z.object({ email: z.string().email() }).parse(req.body);
  res.json({
    message:
      "Password reset flow accepted. Configure SMTP to send production reset emails."
  });
});

router.post("/verify-email", requireAuth, (req, res) => {
  const user = store.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  user.emailVerified = true;
  res.json({ user: sanitizeUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = store.findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export default router;
