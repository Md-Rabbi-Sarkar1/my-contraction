import { z } from "zod";
import { uuidSchema } from "../../validation/common";
export const createIssueSchema = z
  .object({
    projectId: uuidSchema,
    title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
    description: z.string().trim().min(1, "Description is required").max(5000, "Description must be at most 5000 characters"),
    location: z.string().trim().max(255, "Location must be at most 255 characters").optional(),
    priority: z.string().optional(),
    assigneeId: uuidSchema.optional(),
  })
  .strict();