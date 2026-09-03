import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const invite= catchAsync(async (req: Request, res: Response) => {

	const payload = req.body;
	const user = req.user
	// console.log(user)
	const{invitation,token} =await UserService.invite(user as JwtPayload,payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "invite Sent",
		data:{invitation,token}
	});
});
const acceptInvite= catchAsync(async (req: Request, res: Response) => {

	const payload = req.body;

	const {companyId,userId} =await UserService.acceptInvite(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "invite Sent",
		data:{companyId,userId}
	});
});

export const UserController ={
    invite,
	acceptInvite
}