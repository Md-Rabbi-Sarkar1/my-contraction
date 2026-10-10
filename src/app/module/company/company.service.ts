import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../auth/auth.interface";
import { IupdatePayload } from "./company.controller";

const getProfile = async (user: JwtPayload) => {
	const company = await prisma.company.findUnique({
		where: {
			id: user.companyId,
		},
		select: {
			id: true,
			name: true,
			slug: true,
			logoUrl: true,
		},
	});

	if (!company) {
		throw new Error("Company not found");
	}

	return company;
};
const updateCompany = async (user: JwtPayload, payload:IupdatePayload) => {
	const company = await prisma.company.update({
		where: {
			id: user.companyId,
		},
		data:{
			name:payload.name,
			slug:payload.slug
		}
	});

	if (!company) {
		throw new Error("Company not found");
	}

	return company;
};

export const CompanyService = {
	getProfile,
	updateCompany
};
