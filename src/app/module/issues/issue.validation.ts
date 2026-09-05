import { z } from "zod";
import { uuidSchema } from "../../validation/common";
import { IssueStatus, TaskPriority } from "../../../generated/prisma/enums";

const issuePrioritySchema = z.enum(TaskPriority);
const issueStatusSchema = z.enum(IssueStatus);
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

  export const updateIssueSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters").optional(),
    description: z.string().max(5000, "Description must be at most 5000 characters").optional(),
    location: z.string().trim().max(255, "Location must be at most 255 characters").optional(),
    priority: issuePrioritySchema.optional(),
    assigneeId: uuidSchema.nullable().optional(),
    status: issueStatusSchema.optional(),
    resolution: z.string().max(5000, "Resolution must be at most 5000 characters").optional(),
  })
  .strict();