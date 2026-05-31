import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { store } from "../services/store.js";

const router = Router();

const noteBody = z.object({
  title: z.string().min(1).max(160),
  type: z.enum(["Note", "PDF", "Link", "YouTube"]),
  subject: z.string().min(1).max(80),
  body: z.string().min(1).max(4000),
  url: z.string().url().optional().or(z.literal(""))
});

router.get("/", requireAuth, (req, res) => {
  res.json({ notes: store.getNotes(req.user!.id) });
});

router.post("/", requireAuth, (req, res) => {
  const body = noteBody.parse(req.body);
  const note = store.createNote(req.user!.id, {
    ...body,
    url: body.url || undefined
  });
  res.status(201).json({ note });
});

router.patch("/:noteId", requireAuth, (req, res) => {
  const body = noteBody.partial().parse(req.body);
  const note = store.updateNote(req.user!.id, String(req.params.noteId), {
    ...body,
    url: body.url || undefined
  });
  if (!note) {
    res.status(404).json({ message: "Note not found." });
    return;
  }
  res.json({ note });
});

router.delete("/:noteId", requireAuth, (req, res) => {
  store.deleteNote(req.user!.id, String(req.params.noteId));
  res.status(204).end();
});

export default router;
