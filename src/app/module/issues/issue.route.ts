import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { IssueController } from "./issue.controller";

const router = Router();


router.post(
	"/:projectId",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),
	IssueController.create,
);

router.get('/',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),IssueController.getAllIssues)

router.get('/:projectId',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),IssueController.getIssues)

router.get('/:issueId/issue',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),IssueController.issueById)

router.patch(
	"/:issueId",
	auth(
		CompanyRole.ADMIN,
		
		CompanyRole.PROJECT_MANAGER,
		
	),
	IssueController.update,
);
router.delete("/:issueId",auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),IssueController.remove)

export const IssueRoute = router;
