import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router = Router();
router.get(
	"/",
	auth(
		CompanyRole.ADMIN,
		CompanyRole.ENGINEER,
		CompanyRole.WORKER,
		CompanyRole.PROJECT_MANAGER,
	),
	NotificationController.list,
);
router.patch('/:id/read',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),NotificationController.readNotification)
router.get('/:id',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),NotificationController.notificationById)

export const NotificationRoute = router;
