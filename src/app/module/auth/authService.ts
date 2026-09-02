import { SigningOptions } from "node:crypto";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { googleClient } from "../../lib/googleAuth";
import { IGoogleLoginPayload, ILoginUserPayload, IRegisterPayload } from "./auth.interface";
import { TokenPayload } from "google-auth-library";
import { SignOptions } from "jsonwebtoken";
import { AuthProvider, CompanyRole, UserStatus } from "../../../generated/prisma/enums";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";

const register = async (payload: IRegisterPayload) => {
	const { companyName, slug, user : userData } = payload;
	


	const isUserExists = await prisma.user.findFirst({
		where: {
			 email:userData.email
			},
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await hashPassword(userData.paassword)

	const expirationSeconds = 5 * 60

	const otpKey = `patient-registration-otp:${userData.email}`
	const otpValue = crypto.randomInt(100000, 1000000).toString();

	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds
		}
	})

	const userRegistrationKey = `patient-registration-data:${userData.email}`
	const redisUserDataPayload = {
		companyName,
		slug,
		password: hashedPassword,
		user: userData
	}

	await redisClient.set(
		userRegistrationKey, 
		JSON.stringify(redisUserDataPayload), 
		{
			expiration: {
				type: "EX",
				value: expirationSeconds
			}
		}
	)

	await transporter.sendMail({
		from: config.email_sender,
		to: userData.email,
		subject: "Email Verification",
		text : `Your OTP is ${otpValue}`,
		html: `<h1>Your OTP is ${otpValue}</h1>`
		
	})
};



const login = async(payload:ILoginUserPayload)=>{
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

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new Error("Invalid Or Expired Google Id Token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("Invalid Or Expired Google Id Token");
	}

	if (!googleIdTokenPayload.email) {
		throw new Error("Google Email Not Found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google Email User Name Not Found");
	}

	const ifUserExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = ifUserExistWithGoogleAuth;

	if (!ifUserExistWithGoogleAuth) {
		const ifUserExistWithCredentials = await prisma.user.findFirst({
			where: {
				email: googleIdTokenPayload.email,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});

		if (ifUserExistWithCredentials) {
			if (!ifUserExistWithCredentials.emailVerified) {
				throw new Error("Email Not Verified");
			}

			if (ifUserExistWithCredentials.status === UserStatus.BLOCKED) {
				throw new Error("User Is Blocked");
			}

			if (
				ifUserExistWithCredentials.isDeleted ||
				ifUserExistWithCredentials.status === UserStatus.DELETED
			) {
				throw new Error("User Is Deleted");
			}

			user = await prisma.user.update({
				where: {
					id: ifUserExistWithCredentials.id,
				},

				data: {
					googleId: googleIdTokenPayload.sub,
					authProvider:AuthProvider.GOOGLE,
					emailVerified:true
				},
			});
		} 
	}

	if (!user) {
		throw new Error("User Not Found You have to First Login With Cradensial");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User Is Blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User Is Deleted");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};
export const AuthService = {
	register,
	login,
    refreshToken,
    googleLogin
};