import { Router } from "express";
import { TaskController } from "./task.controller";
import { auth } from "../../../middleware/checkAuth";
import { CompanyRole } from "../../../../generated/prisma/enums";

const router = Router();

router.get("/",auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),TaskController.listAll)
router.patch("/:id/status",auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),TaskController.transitionStatus);
router.delete("/:id",auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),TaskController.remove)
export const TaskRouter = router;