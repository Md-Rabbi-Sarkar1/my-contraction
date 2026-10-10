import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { IRequestUser } from "../auth/auth.interface";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { CompanyService } from "./company.service";
export interface IupdatePayload{
	name:string
	slug:string

}
const getProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;

	if (!user) {
		throw new Error("User information is missing in the request");
	}

	const result = await CompanyService.getProfile(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Company profile fetched successfully",
		data: result,
	});
});
const updateCompany = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as IRequestUser;
	const payload = req.body
	if (!user) {
		throw new Error("User information is missing in the request");
	}

	const result = await CompanyService.updateCompany(user, payload as IupdatePayload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Company updated successfully",
		data: result,
	});
});

export const CompanyController = {
	getProfile,
	updateCompany
};
