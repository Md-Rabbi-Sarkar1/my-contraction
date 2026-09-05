import { z } from "zod";
import { dateSchema, uuidSchema } from "../../validation/common";
import { ExpenseCategory, ExpenseStatus } from "../../../generated/prisma/enums";
const expenseCategorySchema = z.enum(ExpenseCategory);
const expenseStatusSchema = z.enum(ExpenseStatus);
export const createExpenseSchema = z
  .object({
    projectId: uuidSchema,
    category: expenseCategorySchema,
    amount: z.coerce.number().positive("Amount must be positive").max(9999999999.99, "Amount is too large"),
    description: z.string().trim().min(1, "Description is required").max(2000, "Description must be at most 2000 characters"),
    expenseDate: dateSchema,
  })
  .strict();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;