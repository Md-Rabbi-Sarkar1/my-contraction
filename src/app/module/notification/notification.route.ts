import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router = Router();
router.get('/',auth(CompanyRole.ADMIN,CompanyRole.ENGINEER),NotificationController.list)

export const NotificationRoute = router;