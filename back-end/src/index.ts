// index.ts
import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./config/database";
import userRouter from "./routes/userRouter";
import notesRouter from "./routes/noteRouter";
import { errorHandler } from "./middleware/errorHandler";
dotenv.config();

const app = express();

const port = process.env["PORT"];

app.use(json());

app.use(cors());

connectToDatabase()
	.then(() => {
		app.use("/api/users", userRouter);

		app.use("/api/notes", notesRouter);

		app.use(errorHandler);

		app.listen(port, () => {
			console.log(`app is on ${port}`);
		});
	})
	.catch((err) => console.log(err));
