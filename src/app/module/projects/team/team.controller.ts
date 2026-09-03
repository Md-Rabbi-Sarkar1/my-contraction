import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status";
import { TeamService } from "./team.service";
import { JwtPayload } from "jsonwebtoken";

const addMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const {id} = req.params
    const {userId} = req.body;
    
    // console.log(user)
    const result = await TeamService.addMember(user as JwtPayload,id as string,userId)

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Successfully add Member",
            data: { result }
        });
});
export const TeamController = {
    addMember
}