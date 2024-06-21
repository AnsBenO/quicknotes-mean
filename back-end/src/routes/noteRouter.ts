// routes/noteRoutes.ts
import express from "express";
import {
	getNotes,
	getNote,
	createNote,
	updateNote,
	deleteNote,
} from "../controllers/noteController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticateToken, getNotes);
router.get("/:noteId", authenticateToken, getNote);
router.post("/", authenticateToken, createNote);
router.patch("/:noteId", authenticateToken, updateNote);
router.delete("/:noteId", authenticateToken, deleteNote);

export default router;
