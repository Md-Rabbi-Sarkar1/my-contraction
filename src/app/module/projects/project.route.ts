import { Router } from "express";
import { ProjecController } from "./prlject.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN),ProjecController.create)
export const ProjectRoute = router