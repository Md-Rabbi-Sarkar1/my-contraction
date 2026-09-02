import { SigningOptions } from "node:crypto";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { googleClient } from "../../lib/googleAuth";
import { IGoogleLoginPayload, ILoginUserPayload, IRegisterPayload, IRequestUser, IVerifyEmailPayload } from "./auth.interface";
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
		where: { email: userData.email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await hashPassword(userData.paassword);
	const expirationSeconds = 5 * 60; // 5 minutes

	const otpKey = `user-registration-otp:${userData.email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();

	//  CORRECT 'redis' PACKAGE SYNTAX
	await redisClient.set(otpKey, otpValue, {
		EX: expirationSeconds
	});

	const userRegistrationKey = `user-registration-data:${userData.email}`;
	
	//  CRUCIAL SECURITY FIX: Save the 'hashedPassword' instead of raw text
	const redisUserDataPayload = {
		companyName,
		slug,
		user: {
			...userData,
			paassword: hashedPassword 
		}
	};

	//  CORRECT 'redis' PACKAGE SYNTAX
	await redisClient.set(
		userRegistrationKey, 
		JSON.stringify(redisUserDataPayload), 
		{
			EX: expirationSeconds
		}
	);

	await transporter.sendMail({
		from: config.email_sender,
		to: userData.email,
		subject: "Email Verification",
		text : `Your OTP is ${otpValue}`,
		html: `<h1>Your OTP is ${otpValue}</h1>`
	});
};


const verifyPatientEmail = async (payload : IVerifyEmailPayload) => {

	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const isUserExist = await prisma.user.findFirst({
		where: { email },
	});

	if (isUserExist?.status === "BLOCKED") {
		throw new Error("User is Blocked")
	}

	if (isUserExist?.emailVerified) {
		throw new Error("Email ALready Verified")
	}

	if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
		throw new Error("User is Deleted")
	}

	const otpKey = `user-registration-otp:${email}`

	const redisOtp = await redisClient.get(otpKey)
	console.log(redisOtp)

	if (!redisOtp) {
		throw new Error("Invalid OTP")
	}

	if (redisOtp !== otp) {
		throw new Error("OTP Does Not Match")
	}

	await redisClient.del(otpKey)

	const userRegistrationKey = `user-registration-data:${email}`

	const redisUserData = await redisClient.get(userRegistrationKey)

	if(!redisUserData){
		throw new Error ("User Doesnt Exist");
	}

	const userPayload : IRegisterPayload = JSON.parse(redisUserData)

	const createdUser = await prisma.company.create({
			data:{
			  name: userPayload.companyName,
			  slug:userPayload.slug,
			  users:{
				create:{
				  name: userPayload.user.name,
				  email: userPayload.user.email,
				  passwordHash:userPayload.user.paassword,
				  role: userPayload.user.role,
				  authProvider: AuthProvider.CREDENTIAL,
				  emailVerified: true,
				}
			  }
			},
		include: {
			 users:{
				omit:{
				passwordHash:true
			 }
			 }
			 },
	});

	await redisClient.del(userRegistrationKey)




	await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Welcome ",
		text : `Your successfuly registered`,
		html: `<h1>Thankes for joining</h1>`
		
	})

	const { users, ...company } = createdUser;
	const adminUser = users[0];
	const jwtPayload = {
		userId: adminUser.id,
		name: adminUser.name,
		email: adminUser.email,
		role: adminUser.role,
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
		company,
		users,
		accessToken,
		refreshToken,
	};

}

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

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findFirst({
		where: {
			id: user.userId,
		},
		include: {
			company: true,
		},
		omit: {
			passwordHash: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

export const AuthService = {
	register,
	verifyPatientEmail,
	login,
    refreshToken,
    googleLogin,
	getMe
};