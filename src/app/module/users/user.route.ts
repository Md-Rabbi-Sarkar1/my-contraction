import { Router } from "express";
import { UserController } from "./user.controller";

import { CompanyRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post("/invitations",auth(CompanyRole.ADMIN),UserController.invite)
router.post('/invitations/accept',UserController.acceptInvite)

export const UserRoutes = router