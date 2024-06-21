import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoDBUrl = process.env["DB_URL"];

export const connectToDatabase = async () => {
	try {
		await connect(mongoDBUrl as string);
		console.log("Successfully connected to database.");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit();
	}
};
