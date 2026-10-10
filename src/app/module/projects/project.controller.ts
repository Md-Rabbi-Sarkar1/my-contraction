import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProjectService } from "./project.service";
import { JwtPayload } from "jsonwebtoken";
import { createProjectSchema } from "./project.validation";

const create = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const cleanFilters = createProjectSchema.parse(req.body);

		const result = await ProjectService.create(
			user as JwtPayload,
			cleanFilters,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Successfully create project",
			data: { result },
		});
	},
);
const getProjects = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		

		const result = await ProjectService.getProjects(
			user as JwtPayload,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Successfully retrive project",
			data: { result },
		});
	},
);
const singleProject = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const {id}=req.params

		const result = await ProjectService.singleProject(
			user as JwtPayload,id as string
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Successfully retrive project",
			data: { result },
		});
	},
);
const updateProject = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const cleanFilters = createProjectSchema.parse(req.body);
		const {id}=req.params

		const result = await ProjectService.updateProject(
			user as JwtPayload,id as string ,cleanFilters
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Project update Succefully",
			data: { result },
		});
	},
);
const deleteProject = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		
		const {id}=req.params

		const result = await ProjectService.deleteProject(
			user as JwtPayload,id as string 
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Project delete Succefully",
			data: { result },
		});
	},
);
export const ProjecController = {
	create,
	getProjects,
	singleProject,
	updateProject,
	deleteProject
};
