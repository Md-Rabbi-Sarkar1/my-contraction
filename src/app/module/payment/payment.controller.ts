import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { PaymentServices } from "./payment.service";

const payCompany = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await PaymentServices.payCompany( user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Company Payment Initiated Successfully",
		data: result,
	});
});

const paymentCallback = catchAsync(
	async (req: Request, res: Response) => {
		const { redirectUrl } = await PaymentServices.paymentCallback(
			req.query,
		);

		res.redirect(redirectUrl);
		// sendResponse(res, {
		//     statusCode: httpStatus.OK,
		//     success: true,
		//     message: "User profile fetched successfully",
		//     data: result,
		// });
	},
);

export const PaymentController ={
    payCompany,
    paymentCallback
}