import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import UserModel from "../models/User";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
dotenv.config();

let SECRET: string = process.env["SESSION_SECRET"] as string;
let REFRESH_SECRET: string = process.env["REFRESH_SECRET"] as string;

export const getAuthenticatedUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.userId) {
			throw createHttpError(401, "User ID not found");
		}
		const user = await UserModel.findById(req.userId).select("+email");
		if (!user) {
			throw createHttpError(404, "User not found");
		}
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

interface SignUpBody {
	username?: string;
	email?: string;
	password?: string;
}

export const signUp = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const body = req.body as SignUpBody;
	const username = body.username;
	const email = body.email;
	const passwordRaw = body.password;
	try {
		if (!username || !email || !passwordRaw) {
			throw createHttpError(400, "All fields are required");
		}

		const existingUsername = await UserModel.findOne({
			username: username,
		});

		if (existingUsername) {
			throw createHttpError(
				409,
				"Username already taken. Please choose a different one or log in instead."
			);
		}

		const existingEmail = await UserModel.findOne({ email: email });

		if (existingEmail) {
			throw createHttpError(
				409,
				"A user with this email address already exists. Please log in instead."
			);
		}

		const passwordHashed = await bcrypt.hash(passwordRaw, 10);

		const newUser = await UserModel.create({
			username: username,
			email: email,
			password: passwordHashed,
		});
		const authToken = jwt.sign({ userId: newUser._id }, SECRET, {
			expiresIn: "15m",
		});
		const refreshToken = jwt.sign({ userId: newUser._id }, REFRESH_SECRET, {
			expiresIn: "7d",
		});
		res.status(201).json({ user: newUser, authToken, refreshToken });
	} catch (error) {
		next(error);
	}
};

interface LoginBody {
	username?: string;
	password?: string;
}

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const body = req.body as LoginBody;
	const username = body.username;
	const password = body.password;

	try {
		if (!username || !password) {
			throw createHttpError(400, "All fields are required");
		}

		const user = await UserModel.findOne({ username: username }).select(
			"+password"
		);
		if (!user) {
			throw createHttpError(401, "Invalid credentials");
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			throw createHttpError(401, "Invalid credentials");
		}

		const authToken = jwt.sign({ userId: user._id }, SECRET, {
			expiresIn: "3m",
		});
		const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
			expiresIn: "7d",
		});
		res.status(200).json({ user, authToken, refreshToken });
	} catch (error) {
		next(error);
	}
};
export const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { authToken } = req.body;

	try {
		if (!authToken) {
			throw createHttpError(400, "Refresh authToken required");
		}
		const decoded = jwt.verify(authToken, REFRESH_SECRET) as {
			userId: string;
		};
		const newAccessToken = jwt.sign({ userId: decoded.userId }, SECRET, {
			expiresIn: "15m",
		});
		console.info("[new authToken] --> ", newAccessToken);

		res.status(200).json({ authToken: newAccessToken });
	} catch (error) {
		next(error);
	}
};

export const logout = async (_req: Request, res: Response) => {
	res.clearCookie("jwtToken");

	res.json({ message: "Logged out successfully" });
};
