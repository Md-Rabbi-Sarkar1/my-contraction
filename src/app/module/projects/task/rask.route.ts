import { Router } from "express";
import { TaskController } from "./task.controller";
import { auth } from "../../../middleware/checkAuth";
import { CompanyRole } from "../../../../generated/prisma/enums";

const router = Router();

router.get("/",auth(CompanyRole.ADMIN),TaskController.listAll)
router.patch("/:id/status",auth(CompanyRole.ADMIN),TaskController.transitionStatus);

export const TaskRouter = router;