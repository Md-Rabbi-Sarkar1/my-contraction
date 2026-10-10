import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { IssueService } from "./issue.service";
import { createIssueSchema, updateIssueSchema } from "./issue.validation";
import { CreateIssueInput, UpdateIssueInput } from "./issue.interface";

const create = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const cleanFilters = createIssueSchema.parse(req.body);
		const {projectId}=req.params
		const result = await IssueService.create(
			user as JwtPayload,
			cleanFilters as CreateIssueInput,
			projectId  as string
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue create succefully",
			data: { result },
		});
	},
);
const update = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { issueId } = req.params;
		const cleanFilters = updateIssueSchema.parse(req.body);

		const result = await IssueService.update(
			user as JwtPayload,
			issueId as string,
			cleanFilters as UpdateIssueInput,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue update succefully",
			data: { result },
		});
	},
);
const getIssues = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { projectId } = req.params;
		

		const result = await IssueService.getIssues(
			user as JwtPayload,
			projectId as string,
			
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue retrive succefully",
			data: { result },
		});
	},
);
const issueById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const { issueId } = req.params;
		

		const result = await IssueService.issueById(
			user as JwtPayload,
			issueId as string,
			
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue retrive succefully",
			data: { result },
		});
	},
);
const getAllIssues = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
	

		const result = await IssueService.getAllIssues(
			user as JwtPayload
			
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue retrive succefully",
			data: { result },
		});
	},
);
const remove = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user =req.user
		const { issueId } = req.params;
console.log(issueId)
		const result = await IssueService.remove(user as JwtPayload, issueId as string);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Issue remove succefully",
			data: { result },
		});
	},
);
export const IssueController = {
	create,
	update,
	getIssues,
	issueById,
	getAllIssues,
	remove
};
