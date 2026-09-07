import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../auth/auth.interface";

const getProfile = async (user: JwtPayload) => {
	const company = await prisma.company.findUnique({
		where: {
			id: user.companyId,
		},
		select:{
            id: true, name: true, slug: true, logoUrl: true
        }
	});

	if (!company) {
		throw new Error("Company not found");
	}

	return company;
};

export const CompanyService = {
    getProfile
}