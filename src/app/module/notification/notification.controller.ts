import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";
import httpStatus from "http-status";
import { notificationListQuerySchema } from "./notification.validation";

const list = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const cleanFilters = notificationListQuerySchema.parse(req.query);

		const result = await NotificationService.list(
			user as JwtPayload,
			cleanFilters,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Notification retrive succefully",
			data: { result },
		});
	},
);
const notificationById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const {id} =req.params

		const result = await NotificationService.notificationById(
			user as JwtPayload,
			id as string
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Notification retrive succefully",
			data: { result },
		});
	},
);
const readNotification = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;
		const {id} =req.params

		const result = await NotificationService.readNotification(
			user as JwtPayload,
			id as string
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Notification read succefully",
			data: { result },
		});
	},
);

export const NotificationController = {
	list,
	notificationById,
	readNotification
};
