import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProjectService } from "./project.service";
import { JwtPayload } from "jsonwebtoken";

const create= catchAsync(async (req: Request, res: Response, next: NextFunction) => {

	const payload = req.body;
	const user = req.user
	// console.log(user)
	const result = await ProjectService.create(user as JwtPayload,payload)

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Successfully create project",
		data:{result}
	});
});
export const ProjecController ={
    create
}