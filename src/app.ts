import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/authRoute";
import { UserRoutes } from "./app/module/users/user.route";
import { ProjectRoute } from "./app/module/projects/project.route";
import { TaskRouter } from "./app/module/projects/task/rask.route";
import { PaymentRouter } from "./app/module/payment/payment.route";
import { NotificationRoute } from "./app/module/notification/notification.route";
import { IssueRoute } from "./app/module/issues/issue.route";
import { MeterialRoute } from "./app/module/material/material.route";
import { ExpenseRoute } from "./app/module/expense/expense.route";
import { DocumentRoute } from "./app/module/document/document.route";
import { ReportRoute } from "./app/module/report/report.route";
import { CompnayRouter } from "./app/module/company/company.route";
// import { CompnayRouter } from './app/module/company/company.service'
// import { ReportRoute } from './app/module/report/report.interface'
// import { DocumentRoute } from './app/module/document/document.validation'

const app: Application = express();

app.use(
	cors({
		origin: [config.frontend_url as string,"https://my-constraction-frontend.vercel.app" ],
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoutes);
app.use("/api/company", CompnayRouter);
app.use("/api/user", UserRoutes);
app.use("/api/projects", ProjectRoute);
app.use("/api/tasks", TaskRouter);

app.use("/api/payment", PaymentRouter);

app.use("/api/notifications", NotificationRoute);
app.use("/api/issues", IssueRoute);
app.use("/api/materials", MeterialRoute);
app.use("/api/expenses", ExpenseRoute);
app.use("/api/documents", DocumentRoute);
app.use("/api/daily-reports", ReportRoute);

app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Contraction Provider Server",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
