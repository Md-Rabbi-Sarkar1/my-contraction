import { Router } from "express";
import { AuthController } from "./authController";
// import { AuthController } from "./authcontroller";

const router = Router();

router.post('/login',AuthController.login)
router.post('/refresh-token',AuthController.refreshToken)
export const AuthRoutes = router;