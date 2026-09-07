import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProjectService } from "./project.service";
import { JwtPayload } from "jsonwebtoken";
import { createProjectSchema } from "./project.validation";

const create= catchAsync(async (req: Request, res: Response, next: NextFunction) => {

	
	const user = req.user
	const cleanFilters = createProjectSchema
		 .parse(req.body);

       
	const result = await ProjectService.create(user as JwtPayload,cleanFilters)

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