import { JwtPayload } from "jsonwebtoken"
import { CreateIssueData, CreateIssueInput } from "./issue.interface"
import { prisma } from "../../lib/prisma"

const create = async (user: JwtPayload, payload: CreateIssueInput) => {
    console.log(user,payload)
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

export const IssueService = {
    create
}