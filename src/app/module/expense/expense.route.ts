import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { auth } from "../../middleware/checkAuth";
import { CompanyRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/",
	auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),
	ExpenseController.create,
);

router.get('/',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ExpenseController.getAllExpenses)

router.get('/:id',auth(CompanyRole.ADMIN, CompanyRole.PROJECT_MANAGER,CompanyRole.ENGINEER,CompanyRole.WORKER),ExpenseController.expenseById)

export const ExpenseRoute = router;
