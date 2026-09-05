import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router =Router()

router.post('/',auth(CompanyRole.ADMIN),ExpenseController.create)

export const ExpenseRoute = router