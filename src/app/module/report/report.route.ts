import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { ReportController } from "./report.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN,CompanyRole.WORKER,CompanyRole.ENGINEER,CompanyRole.PROJECT_MANAGER),ReportController.create)
export const ReportRoute = router