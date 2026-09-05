import { JwtPayload } from "jsonwebtoken"
import { CreateIssueData, CreateIssueInput, UpdateIssueInput } from "./issue.interface"
import { prisma } from "../../lib/prisma"
import { Prisma } from "../../../generated/prisma/client"
import { tr } from "zod/locales"

const create = async (user: JwtPayload, payload: CreateIssueInput) => {
    console.log(user, payload)
    const project = await prisma.project.findFirst({
        where: {
            id: payload.projectId,
            companyId: user.companyId
        },
        select: {
            id: true,
            managerId: true
        }
    })
    if (!project) {
        throw new Error("Project not found");
    }

    if (payload.assigneeId !== undefined) {
        const assignee = await prisma.user.findFirst({
            where: {
                id: payload.assigneeId,
                companyId: user.companyId
            },
            select: { id: true }
        })
        if (!assignee) {
            throw new Error("Assignee not found");
        }
    }
    const data: CreateIssueData = {
        projectId: payload.projectId,
        reporterId: user.userId,
        title: payload.title,
        description: payload.description,
    };
    if (payload.assigneeId !== undefined) data.assigneeId = payload.assigneeId;
    if (payload.location !== undefined) data.location = payload.location;
    if (payload.priority !== undefined) { data.priority = payload.priority };

    const issue = await prisma.issue.create({
        data: {
            project: {
                connect: {
                    id: data.projectId
                }
            },
            reporter: {
                connect: {
                    id: data.reporterId
                }
            },
            title: data.title,
            description: data.description,
            assignee: {
                connect: {
                    id: data.assigneeId
                }
            },
            location: data.location,
            priority: data.priority
        },
        include: {
            project: { select: { id: true, name: true } },
            reporter: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
        }

    })
    return issue
}

const update = async (user: JwtPayload, id: string, payload: UpdateIssueInput) => {

    const issue = await prisma.issue.findFirst({
        where: {
            id,
            project: {
                companyId: user.companyId
            }
        },
        include: {
            project: { select: { id: true, name: true } },
            reporter: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
        }
    })

    if (!issue) {
        throw new Error("Issue not found");
    }

    if (payload.assigneeId !== undefined && payload.assigneeId !== null) {
        const assignee = await prisma.user.findFirst({
            where: { id: payload.assigneeId, companyId: user.companyId },
            select: { id: true },
        });
        if (!assignee) {
            throw new Error("Assignee not found");
        }
    }
    const project = await prisma.project.findFirst({
        where: {
            id:issue.projectId,
            companyId:user.companyId
        },
        select:{
            id:true,
            managerId:true
        }
    })

  if (!project) {
    throw new Error("Project not found");
  }
const updateData: Prisma.IssueUpdateInput = {};
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.resolution !== undefined) updateData.resolution = payload.resolution;
    if (payload.location !== undefined) updateData.location = payload.location;
    if (payload.assigneeId !== undefined) {
        updateData.assignee = payload.assigneeId === null ? { disconnect: true } : { connect: { id: payload.assigneeId } };
    }
    const issueUpdate = await prisma.issue.update({
        where: { id },
        data: {
           ...updateData
        },
        include: {
            project: { select: { id: true, name: true } },
            reporter: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } }
        }
    })
  return issueUpdate
}

    


export const IssueService = {
    create,
    update
}