import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { CreateExpenseInput, createExpenseSchema } from "./expense.validation";
import { ExpenseService } from "./expense.service";


const create= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
     const cleanFilters = createExpenseSchema.parse(req.body)

    const result = await ExpenseService.create(user as JwtPayload,cleanFilters as CreateExpenseInput )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Expense create succefully",
            data: { result}
        });
});

export const ExpenseController ={
    create
}