// middleware/auth.ts
import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

let secret: string = process.env.SESSION_SECRET as string;
export interface AuthenticatedRequest extends Request {
	userId?: string;
}

export interface AuthenticatedRequest extends Request {
	userId?: string;
}

export const authenticateToken: RequestHandler = (
	req: AuthenticatedRequest,
	_res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return next(createHttpError(401, "Authorization header not provided"));
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		return next(createHttpError(401, "Token not provided"));
	}

	if (!secret) {
		return next(createHttpError(500, "Internal server error"));
	}

	try {
		const decoded = jwt.verify(token, secret) as {
			userId: string;
		};
		req.userId = decoded.userId;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return next(createHttpError(401, "Token expired"));
		}
		console.error("Token verification failed:", error);
		next(createHttpError(401, "Invalid token"));
	}
};
