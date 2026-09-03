import { Router } from "express";
import { ProjecController } from "./project.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { TeamController } from "./team/team.controller";

const router = Router()
router.post('/',auth(CompanyRole.ADMIN),ProjecController.create)
router.post('/:id/members',auth(CompanyRole.ADMIN),TeamController.addMember)

export const ProjectRoute = router