import { ExpenseCategory } from "../../../generated/prisma/enums";

export interface CreateExpenseData {
  projectId: string;
  submittedById: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate: Date;
}