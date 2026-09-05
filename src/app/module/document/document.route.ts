import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { DocumentController } from "./document.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),DocumentController.create)

export const DocumentRoute = router;