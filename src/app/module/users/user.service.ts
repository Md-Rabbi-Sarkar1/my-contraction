import { JwtPayload } from "jsonwebtoken";
import { IaccepteInviteData, InviteUserInput } from "./user.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
	generateInviteToken,
	hashInviteToken,
} from "../../utils/invitation-token";
import { hashPassword } from "../../utils/password";
import { transporter } from "../../lib/nodemailer";
import config from "../../config";

const INVITATION_EXPIRY_DAYS = 7;

const invite = async (user: JwtPayload, payload: InviteUserInput) => {
	const existing = await prisma.user.findFirst({
		where: {
			companyId: user.conpanyId,
			email: payload.email,
		},
		select: {
			id: true,
		},
	});
	if (existing) {
		throw new Error("A user with this email already exists in the company");
	}
	const token = generateInviteToken();
	const tokenHash = hashInviteToken(token);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

	const invitation = await prisma.invitation.create({
		data: {
			companyId: user.companyId,
			email: payload.email,
			role: payload.role,
			tokenHash,
			expiresAt,
		},
		select: {
			companyId: true,
			email: true,
			role: true,
		},
	});
	await transporter.sendMail({
  from: config.email_sender,
  to: payload.email,
  subject: "Token Verification",
  html: `
    <h1>Accept Your Invitation</h1>
    <p>You have been invited to join the team. Click the link below to accept:</p>
    <a href="${config.frontend_url}/accept-invite?token=${token}" style="display:inline-block; background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
      Accept Invitation
    </a>
    <p style="margin-top:20px; font-size:12px; color:#666;">
      If the button doesn't work, copy and paste this link: <br/>
      ${config.frontend_url}/accept-invite?token=${token}
    </p>
  `,
});


	return {
		invitation,
		token,
	};
};

const acceptInvite = async (payload: IaccepteInviteData) => {
	const tokenHash = hashInviteToken(payload.token);
	const invitation = await prisma.invitation.findFirst({
		where: {
			tokenHash,
			status: "PENDING",
		},
	});
	if (!invitation) {
		throw new Error("Invitation not found or already used");
	}
	if (invitation.expiresAt < new Date()) {
		throw new Error("Invitation has expired");
	}

	const passwordHash = await hashPassword(payload.password);

	const created = await prisma.user.create({
		data: {
			companyId: invitation.companyId,
			name: payload.name,
			email: invitation.email,
			passwordHash,
			role: invitation.role,
			emailVerified: true,
		},
		select: {
			id: true,
			companyId: true,
		},
	});
	await prisma.invitation.update({
		where: {
			id: invitation.id,
		},
		data: {
			status: "ACCEPTED",
			acceptedAt: new Date(),
		},
	});
	return {
		companyId: created.companyId,
		userId: created.id,
	};
};
const getManager = async (companyId:string) => {

	const manager = await prisma.user.findMany({
		where: {
			companyId,
			role:"PROJECT_MANAGER",
		},
		select:{
			id:true,
			name:true
		}
	});
	if(!manager){
		throw new Error("Manager Not Found")
	}
	return {
		manager
	};
};
const allUsers = async (companyId:string) => {

	const users= await prisma.user.findMany({
		where: {
			companyId,
		},
		select:{
			id:true,
			name:true,
			email:true,
			role:true
		}
	});
	if(!users){
		throw new Error("Manager Not Found")
	}
	return {
		users
	};
};

export const UserService = {
	invite,
	acceptInvite,
	getManager,
	allUsers
};
