import { SigningOptions } from "node:crypto";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { comparePassword } from "../../utils/password";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
const login = async(payload:any)=>{
const {password,email} = payload;
const user = await prisma.user.findFirst({
    where :{email}
})
const isPasswordMatched = await comparePassword(password,user?.passwordHash as string)
if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED,"Invalid credentials");
	}
const JwtPayload = {
    userId:user?.id,
    name:user?.name,
    email:user?.email,
    role:user?.role
}
const accessToken = jwtUtils.createToken(
    JwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as any
)

const refreshToken = jwtUtils.createToken(
    JwtPayload,
    config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as any,
)

return {
    accessToken,
    refreshToken
}

}


const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as any;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});



	const jwtPayload = {
		userId: user?.id,
		name: user?.name,
		email: user?.email,
		role: user?.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as any,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as any,
	);

	return {
		accessToken,
		refreshToken,
	};
};
export const AuthService = {
	login,
    refreshToken
};