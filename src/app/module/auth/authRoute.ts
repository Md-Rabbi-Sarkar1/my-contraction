import { Router } from "express";
import { AuthController } from "./authController";
// import { AuthController } from "./authcontroller";

const router = Router();

router.post('/register',AuthController.register)
router.post('/login',AuthController.login)
router.post('/refresh-token',AuthController.refreshToken)
router.post("/google", AuthController.googleLogin);
router.post("/verify-email",AuthController.verifyPatientEmail);
export const AuthRoutes = router;