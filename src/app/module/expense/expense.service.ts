import { JwtPayload } from "jsonwebtoken";
import { CreateExpenseInput } from "./expense.validation";
import { prisma } from "../../lib/prisma";
import { CreateExpenseData } from "./expense.interface";
import { da } from "zod/locales";

const create = async (user: JwtPayload, payload: CreateExpenseInput) => {

    const project = await prisma.project.findUnique({
        where: {
            id: payload.projectId
        },
        select: {
            companyId: true
        }
    })
    if (project?.companyId !== user.companyId) {
        throw new Error("Project not found");
    }

    const data: CreateExpenseData = {
        projectId: payload.projectId,
        submittedById: user.userId,
        category: payload.category,
        amount: payload.amount,
        description: payload.description,
        expenseDate: new Date(payload.expenseDate),
    };


    const createExpense = await prisma.expense.create({
        data: {
            project: {
                connect: {
                    id: data.projectId
                }
            },
            submittedBy: {
                connect: {
                    id: data.submittedById
                }
            },
            category: data.category,
            amount: data.amount,
            description: data.description,
            expenseDate: data.expenseDate,
        },
        include: {
            project: { select: { id: true, name: true } },
            submittedBy: { select: { id: true, name: true, email: true } },
            reviewedBy: {
                select: { id: true, name: true, email: true }
            }
        }
        })
    return createExpense

}

export const ExpenseService = {
    create
}