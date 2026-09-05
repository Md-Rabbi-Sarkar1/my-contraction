import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { IssueService } from "./issue.service";
import { createIssueSchema, updateIssueSchema } from "./issue.validation";
import { CreateIssueInput, UpdateIssueInput } from "./issue.interface";

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
const update= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
    const {id} =req.params
     const cleanFilters = updateIssueSchema.parse(req.body)

    const result = await IssueService.update(user as JwtPayload,id as string,cleanFilters as UpdateIssueInput )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Issue update succefully",
            data: { result}
        });
});

export const IssueController = {
    create,
    update
}