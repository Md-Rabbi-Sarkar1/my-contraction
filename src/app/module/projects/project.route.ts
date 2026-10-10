import { Router } from "express";
import { ProjecController } from "./project.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
import { TeamController } from "./team/team.controller";
import { TaskController } from "./task/task.controller";

const router = Router();
router.post(
	"/",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER),
	ProjecController.create,
);

router.put('/:id',auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),ProjecController.updateProject)

router.delete('/:id',auth(CompanyRole.ADMIN,CompanyRole.PROJECT_MANAGER),ProjecController.deleteProject)

router.post(
	"/:id/members",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER),
	TeamController.addMember,
);
router.post(
	"/:id/task",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER, CompanyRole.ENGINEER),
	TaskController.create,
);
router.get('/:projectId/task',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER), TaskController.taskbyProjcet)

router.get("/",auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ProjecController.getProjects)

router.get('/:id',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ProjecController.singleProject)

router.get('/:id/projectMember',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER),TeamController.projectMember)
export const ProjectRoute = router;
