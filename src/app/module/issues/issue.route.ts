import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { IssueController } from "./issue.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN),IssueController.create)
router.patch('/:id',auth(CompanyRole.ADMIN),IssueController.update)

export const IssueRoute = router;