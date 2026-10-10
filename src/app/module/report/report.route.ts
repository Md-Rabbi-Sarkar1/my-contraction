import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { ReportController } from "./report.controller";

const router = Router();
router.post(
	"/",
	auth(
		CompanyRole.ADMIN,
		CompanyRole.WORKER,
		CompanyRole.ENGINEER,
		CompanyRole.PROJECT_MANAGER,
	),
	ReportController.create,
);

router.get('/',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ReportController.getAllReports)
router.get('/:id',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ReportController.reportById)
export const ReportRoute = router;
