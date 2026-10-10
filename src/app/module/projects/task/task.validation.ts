import { z } from "zod";
import { TaskPriority, TaskStatus } from "../../../../generated/prisma/enums";

export const TaskQuerySchema = z.object({
	page: z.string().transform(Number),
	pageSize: z.string().transform(Number),
	status: z.nativeEnum(TaskStatus).optional(),
	priority: z.nativeEnum(TaskPriority).optional(),
	assigneeId: z.string().optional(),
});

export const createTaskSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }).trim(),

	description: z.string().trim().optional(),

	// Validates as an optional ISO-8601 date string.
	// If you want to accept any plain text, remove the `.date()` method.
	startDate: z
		.string()
		.datetime({
			message: "Invalid start date format (expected ISO-8601 timestamp)",
		})
		.optional(),

	assigneeId: z.string().trim().optional(),

	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),

	dueDate: z
		.string()
		.datetime("Invalid due date format (expected ISO-8601 timestamp)")
		.optional(),
});

// Extract the TypeScript type from the schema
export type TCreateTaskSchema = z.infer<typeof createTaskSchema>;
