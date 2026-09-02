import { Router } from "express";
import { AuthController } from "./authController";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
// import { AuthController } from "./authcontroller";

const router = Router();

router.post('/register',AuthController.register)
router.post('/login',AuthController.login)
router.post('/refresh-token',AuthController.refreshToken)
router.post("/google", AuthController.googleLogin);
router.post("/verify-email",AuthController.verifyPatientEmail);
router.get("/me",auth(CompanyRole.ADMIN),AuthController.getMe);

	

export const AuthRoutes = router;