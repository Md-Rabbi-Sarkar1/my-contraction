import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { CompanyController } from "./company.controller";

const router = Router();
router.get('/',auth(CompanyRole.ADMIN),CompanyController.getProfile)
export const CompnayRouter = router;