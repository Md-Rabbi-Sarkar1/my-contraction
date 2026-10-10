import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const invite = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;

	console.log(user);
	const { invitation, token } = await UserService.invite(
		user as JwtPayload,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "invite Sent",
		data: { invitation, token },
	});
});
const acceptInvite = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const { companyId, userId } = await UserService.acceptInvite(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "You are now member of the company",
		data: { companyId, userId },
	});
});
const getManager = catchAsync(async (req: Request, res: Response) => {
	const companyId =req.user?.companyId

	const result = await UserService.getManager(companyId as string);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "You retrive member of the company",
		data: result,
	});
});
const allUsers = catchAsync(async (req: Request, res: Response) => {
	const companyId =req.user?.companyId

	const result = await UserService.allUsers(companyId as string);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User Retrive successfully",
		data: result,
	});
});

export const UserController = {
	invite,
	acceptInvite,
	getManager,
	allUsers
};
