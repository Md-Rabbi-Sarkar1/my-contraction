import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IcreateProjectSchema } from "./project.interface";

const create = async (user: JwtPayload, payload: IcreateProjectSchema) => {
	if (payload.managerId !== undefined) {
		const manager = await prisma.user.findFirst({
			where: {
				id: payload.managerId,
				companyId: user.companyId,
			},
			select: {
				id: true,
				role: true,
			},
		});
		if (!manager) {
			throw new Error("Manager not found");
		}
		if (manager.role !== "PROJECT_MANAGER") {
			throw new Error("This provided user are not Manager");
		}
	}

	const createProject = await prisma.project.create({
		data: {
			companyId: user.companyId,
			name: payload.name,
			description: payload.description,
			location: payload.location,
			clientInfo: payload.clientInfo,
			startDate: payload.startDate ? new Date(payload.startDate) : undefined,
    expectedEndDate: payload.expectedEndDate ? new Date(payload.expectedEndDate) : undefined,
    budget: payload.budget ? Number(payload.budget) : undefined,
			managerId: payload.managerId,
		},
	});

	return createProject;
};
const getProjects = async (user: JwtPayload) => {
const projects = await prisma.project.findMany({
	where:{
		companyId:user?.companyId
	}
})
if(!projects){
	throw new Error("Project Not Found")
}
	return projects;
};
const singleProject = async (user: JwtPayload,id:string) => {
const projects = await prisma.project.findUnique({
	where:{
		id
	}
})
if(!projects){
	throw new Error("Project Not Found")
}
	return projects;
};
const updateProject = async (user: JwtPayload,id:string ,payload:IcreateProjectSchema) => {
const projects = await prisma.project.findUnique({
	where:{
		id
	}
})
if(!projects){
	throw new Error("Project Not Found")
}
const updateProjects= await prisma.project.update({
	where:{
		id
	},
	data:{
		companyId: user.companyId,
			name: payload.name,
			description: payload.description,
			location: payload.location,
			clientInfo: payload.clientInfo,
			startDate: payload.startDate ? new Date(payload.startDate) : undefined,
    expectedEndDate: payload.expectedEndDate ? new Date(payload.expectedEndDate) : undefined,
    budget: payload.budget ? Number(payload.budget) : undefined,
			managerId: payload.managerId,
	}
})
	return updateProjects;
};
const deleteProject = async (user: JwtPayload,id:string ) => {
const projects = await prisma.project.findUnique({
	where:{
		id
	}
})
if(!projects){
	throw new Error("Project Not Found")
}
const deleteProject= await prisma.project.delete({
	where:{id}
}
)
	return deleteProject;
};

export const ProjectService = {
	create,
	getProjects,
	singleProject,
	updateProject,
	deleteProject
};
