import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";
// import { auth } from "google-auth-library";
// import { AuthProvider, CompanyRole } from "../../../generated/prisma/enums";
// import { AuthController } from "../auth/authController";

const router = Router();

router.post('/create',auth(CompanyRole.ADMIN),PaymentController.payCompany)
router.get('/callback',PaymentController.paymentCallback)

export const PaymentRouter = router;