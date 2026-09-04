import { JwtPayload } from "jsonwebtoken"
import { IcreateTaskSchema, TaskListFilters } from "./task.interface"
import { prisma } from "../../../lib/prisma"
import { TaskPriority, TaskStatus } from "../../../../generated/prisma/enums"

const create = async (user: JwtPayload, projectId: string, payload: IcreateTaskSchema) => {
    console.log(user, projectId, payload)
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
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
    // if (user.role === "ADMIN") return;


    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: payload.assigneeId as string
            }
        },
        select: {
            id: true
        }
    })
    if (!membership) {
        throw new Error("Project not found");
    }
    if (payload.assigneeId !== undefined) {
        const assignee = await prisma.user.findFirst({
            where: {
                id: payload.assigneeId,
                companyId: user.companyId,
            },
            select: {
                id: true
            }
        })
        if (!assignee) {
            throw new Error("Assignee not found");
        }
    }
    const createTask = await prisma.task.create({
        data: {
            projectId,
            title: payload.title,
            description: payload.description,
            priority: payload.priority,
            startDate: payload.startDate,
            dueDate: payload.dueDate,
            assigneeId: payload.assigneeId
        }
    })
    return createTask
}


const listall = async (user: JwtPayload, projectId: string | undefined, query: {
    page: number;
    pageSize: number;
    status?: TaskStatus | undefined;
    priority?: TaskPriority | undefined;
    assigneeId?: string | undefined;
}) => {
    const filters: TaskListFilters = {
        companyId: user.companyId,
        page: query.page,
        pageSize: query.pageSize,
    };
    if (projectId !== undefined) filters.projectId = projectId;
    if (query.status !== undefined) filters.status = query.status;
    if (query.priority !== undefined) filters.priority = query.priority;


    if (user.role === "WORKER" || user.role === "ENGINEER") {
        filters.assigneeId = user.sub;
    } else if (query.assigneeId !== undefined) {
        filters.assigneeId = query.assigneeId;
    }

    const result = await prisma.$transaction([
        prisma.task.findMany({
            where: {
                project: {
                    companyId: filters.companyId
                },
                projectId: filters.projectId,
                status: filters.status,
                priority: filters.priority,
                assigneeId: filters.assigneeId
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true, companyId: true } }
            }
        }),
        prisma.task.count({
            where: {
                project: {
                    companyId: filters.companyId
                },
                projectId: filters.projectId,
                status: filters.status,
                priority: filters.priority,
                assigneeId: filters.assigneeId
            },


        })

    ])

    return result


}
export const TaskService = {
    create,
    listall
}