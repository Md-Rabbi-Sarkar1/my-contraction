import { TaskPriority } from "../../../generated/prisma/enums";

export interface  CreateIssueInput {
    projectId: string;
    description: string;
    title: string;
    location?: string | undefined;
    assigneeId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
}

export interface CreateIssueData {
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  title: string;
  description: string;
  location?: string;
  priority?: TaskPriority;
}

export interface UpdateIssueInput  {
    status?: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "CLOSED" | undefined;
    description?: string | undefined;
    location?: string | undefined;
    title?: string | undefined;
    assigneeId?: string | null | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    resolution?: string | undefined;
}