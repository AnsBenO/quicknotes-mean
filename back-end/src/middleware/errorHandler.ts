import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export const errorHandler = (
	err: createHttpError.HttpError,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	res.status(err.status || 500).json({ error: err.message });
	console.error(err);
};
