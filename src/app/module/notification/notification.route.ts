import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router = Router();
router.get('/',auth(CompanyRole.ADMIN,CompanyRole.ENGINEER,CompanyRole.WORKER,CompanyRole.PROJECT_MANAGER),NotificationController.list)

export const NotificationRoute = router;