import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../../../../generated/prisma/enums';

export const TaskQuerySchema = z.object({
  page: z.string().transform(Number),
  pageSize: z.string().transform(Number),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().optional(),
});