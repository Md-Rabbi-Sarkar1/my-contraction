import { Router } from "express";
import { ProjecController } from "./project.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { TeamController } from "./team/team.controller";
import { TaskController } from "./task/task.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN),ProjecController.create)
router.post('/:id/members',auth(CompanyRole.ADMIN),TeamController.addMember)
router.post('/:id/tasks',auth(CompanyRole.ADMIN),TaskController.create)
export const ProjectRoute = router