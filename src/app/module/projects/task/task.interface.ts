import { TaskPriority, TaskStatus } from "../../../../generated/prisma/enums";

export interface IcreateTaskSchema {
        title: string;
    description?: string | undefined;
    startDate?: string | undefined;
    assigneeId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
}
export interface QueryTask {
      page: number;
      pageSize: number;
      status?: TaskStatus | undefined;
      priority?: TaskPriority | undefined;
      assigneeId?: string | undefined;
    }
export interface TaskListFilters {
  companyId: string;
  page: number;
  pageSize: number;
  projectId?: string | undefined;
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  assigneeId?: string | undefined;
}
