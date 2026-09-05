import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { MeterialController } from "./material.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN),MeterialController.create)

export const MeterialRoute = router;