import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { DocumentService } from "./document.service";
import {
	CreateDocumentInput,
	createDocumentSchema,
} from "./document.validation";

const create = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const cleanFilters = createDocumentSchema.parse(req.body);

		const result = await DocumentService.create(
			user as JwtPayload,
			cleanFilters as CreateDocumentInput,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Document create succefully",
			data: { result },
		});
	},
);
const getAllDocuments = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		

		const result = await DocumentService.getAllDocuments(
			user as JwtPayload,
			
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Document retrive succefully",
			data: { result },
		});
	},
);
const documentById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const {id} = req.params

		const result = await DocumentService.documentById(
			user as JwtPayload,
			id as string
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Document retrive succefully",
			data: { result },
		});
	},
);

export const DocumentController = {
	create,
	getAllDocuments,
	documentById
};
