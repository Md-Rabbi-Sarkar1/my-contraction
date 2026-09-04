import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
// import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { CompanyRole } from "../../generated/prisma/enums";
export interface RequestUser {
    email: string;
    name: string;
    userId: string;
    role: CompanyRole;
    companyId:string
}
declare global {
    namespace Express {
        interface Request {
            user?: RequestUser
        }
    }
}

// auth(Role.ADMIN, Role.USER, Role.Author)
// auth() => ...requiredRoles => [Role.ADMIN, Role.USER, Role.AUTHOR]
export const auth = (...requiredRoles: CompanyRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;

        if (!token) {
            throw new Error("You are not logged in. Please log in to access this resource.");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error);
        }

        const { email, name, userId, role ,companyId } = verifiedToken.data as JwtPayload

        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new Error("Forbidden. You don't have permission to access this resource.");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                email,
                name,
                role,
                companyId
            }
        });

        if (!user) {
            throw new Error("User not found. Please log in again.");
        }

        req.user = {
            companyId,
            email,
            name,
            userId,
            role
        }

        next();

    }
    )
}
