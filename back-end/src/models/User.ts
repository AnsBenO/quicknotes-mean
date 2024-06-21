// models/User.ts
import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
	username: {
		type: String,
		required: [true, "Username is required"],
		unique: true,
		trim: true,
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
		trim: true,
		validate: {
			validator: function (email: string) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(email);
			},
			message: (props: { value: string }) =>
				`${props.value} is not a valid email address!`,
		},
		select: false,
	},
	password: {
		type: String,
		required: [true, "Password is required"],
		select: false,
		minlength: [6, "Password must be at least 6 characters long"],
	},
});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
