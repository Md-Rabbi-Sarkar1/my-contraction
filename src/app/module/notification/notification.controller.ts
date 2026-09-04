import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";
import httpStatus from "http-status";
import { notificationListQuerySchema } from "./notification.validation";

const list = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
    const user = req.user
     const cleanFilters = notificationListQuerySchema.parse(req.query)

    const result = await NotificationService.list(user as JwtPayload,cleanFilters )

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Status change succefully",
            data: { result}
        });
});

export const NotificationController ={
    list
}