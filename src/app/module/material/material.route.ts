import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { MeterialController } from "./material.controller";

const router = Router();
router.post("/", auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER), MeterialController.create);

router.get('/',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER),MeterialController.getMaterials)

router.get('/:materialId',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER),MeterialController.materialbyId)

router.post(
	"/:id/transactions",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER, CompanyRole.ENGINEER),
	MeterialController.recordTransaction,
);
export const MeterialRoute = router;
