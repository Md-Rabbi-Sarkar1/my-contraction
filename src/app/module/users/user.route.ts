import { Router } from "express";
import { UserController } from "./user.controller";

import { CompanyRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "../auth/authController";

const router = Router();

router.post("/invitations", auth(CompanyRole.ADMIN), UserController.invite);

router.post("/invitations/accept", UserController.acceptInvite);
router.get('/managers', auth(CompanyRole.ADMIN),UserController.getManager)
router.get('/allusers',auth(CompanyRole.ADMIN),UserController.allUsers)
export const UserRoutes = router;
