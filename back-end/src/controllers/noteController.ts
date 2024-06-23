// controllers/noteController.ts
import { NextFunction, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import NoteModel from "../models/Note";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../middleware/auth";
dotenv.config();

export const getNotes: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	(async () => {
		try {
			const notes = await NoteModel.find({ userId: req.userId });
			res.status(200).json(notes);
		} catch (error) {
			next(error);
		}
	})();
};

export const getNote: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	(async () => {
		const noteId = req.params.noteId;

		try {
			const note = await NoteModel.findById(noteId);

			if (!note) {
				throw createHttpError(404, "Note not found");
			}

			if (!note.userId.equals(req.userId)) {
				throw createHttpError(401, "You cannot access this note");
			}

			res.status(200).json(note);
		} catch (error) {
			next(error);
		}
	})();
};

interface CreateNoteBody {
	title?: string;
	text?: string;
}

export const createNote = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const { title, text } = req.body as CreateNoteBody;

	try {
		if (!title || !text) {
			throw createHttpError(400, "All fields are required");
		}

		const newNote = await NoteModel.create({
			userId: req.userId,
			title,
			text,
		});

		res.status(201).json(newNote);
	} catch (error) {
		next(error);
	}
};

interface UpdateNoteBody {
	title?: string;
	text?: string;
}

export const updateNote = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const { title, text } = req.body as UpdateNoteBody;
	const noteId = req.params.noteId;

	try {
		if (!title || !text) {
			throw createHttpError(400, "All fields are required");
		}

		const note = await NoteModel.findById(noteId);

		if (!note) {
			throw createHttpError(404, "Note not found");
		}

		if (!note.userId.equals(req.userId)) {
			throw createHttpError(401, "You cannot access this note");
		}

		note.title = title;
		note.text = text;

		const updatedNote = await note.save();
		res.status(200).json(updatedNote);
	} catch (error) {
		next(error);
	}
};

export const deleteNote: RequestHandler = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	(async () => {
		const noteId = req.params.noteId;

		try {
			const note = await NoteModel.findById(noteId);

			if (!note) {
				throw createHttpError(404, "Note not found");
			}

			if (!note.userId.equals(req.userId)) {
				throw createHttpError(401, "You cannot access this note");
			}

			await NoteModel.deleteOne({ _id: noteId });

			res.sendStatus(204);
		} catch (error) {
			next(error);
		}
	})();
};
