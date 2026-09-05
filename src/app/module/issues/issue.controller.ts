import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { IssueService } from "./issue.service";
import { createIssueSchema } from "./issue.validation";
import { CreateIssueInput } from "./issue.interface";

const create= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
     const cleanFilters = createIssueSchema.parse(req.body)

    const result = await IssueService.create(user as JwtPayload,cleanFilters as CreateIssueInput )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Issue create succefully",
            data: { result}
        });
});

export const IssueController = {
    create
}