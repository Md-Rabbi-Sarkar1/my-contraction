import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

import { createDailyWorkReportSchema } from "./report.validation";
import { ReportService } from "./report.service";
import { CreateReportPayload } from "./report.interface";

const create= catchAsync(async (req: Request, res: Response, next: NextFunction ) => {
   
    const user = req.user
     const cleanFilters = createDailyWorkReportSchema.parse(req.body)

    const result = await ReportService.create(user as JwtPayload,cleanFilters as CreateReportPayload )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Report create succefully",
            data: { result}
        });
});

export const ReportController ={
    create
}