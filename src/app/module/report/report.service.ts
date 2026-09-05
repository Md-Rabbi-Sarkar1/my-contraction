import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

import { connect } from "node:http2";
import { CreateReportData, CreateReportPayload } from "./report.interface";

const create = async (user: JwtPayload, payload: CreateReportPayload) => {

    const project = await prisma.project.findUnique({
        where: {
            id: payload.projectId
        },
        select: {
            companyId: true, id: true
        }
    })
    if (project?.companyId !== user.companyId) {
        throw new Error("Project not found");
    }
    const parseDate = (value: string): Date => {
        const data = new Date(value);
        if (Number.isNaN(data.getTime())) {
            throw new Error("Invalid data")
        }
        return data
    }
    const data: CreateReportData = {
        projectId: payload.projectId,
        submittedById: user.userId,
        reportDate: parseDate(payload.reportDate),
        workCompleted: payload.workCompleted,
        hoursWorked: payload.hoursWorked,
        progressPct: payload.progressPct,
        workers: payload.workers,
    };

    if (payload.materialsUsed !== undefined) {
        data.materialsUsed = payload.materialsUsed;
    }
    if (payload.problemsEncountered !== undefined) {
        data.problemsEncountered = payload.problemsEncountered;
    }
    if (payload.notes !== undefined) {
        data.notes = payload.notes;
    }
    const { workers, submittedById, projectId, reportDate, materialsUsed, problemsEncountered, notes, ...rest } = data
    const createReport = await prisma.dailyWorkReport.create({
        data: {
            ...rest,
            reportDate,
            materialsUsed: materialsUsed ?? null,
            problemsEncountered: problemsEncountered ?? null,
            notes: notes ?? null,
            submittedBy: {
                connect: {
                    id: submittedById
                }
            },
            project: {
                connect: {
                    id: projectId
                }
            },
            workers: {
                create: workers.map((worker) => ({
                    name: worker.name,
                    role: worker.role ?? null,
                    hoursWorked: worker.hoursWorked ?? null,
                }))
            }
        },
        include: {
            workers: {
                orderBy: { createdAt: "asc" as const },
            },
            project: {
                select: { id: true, name: true },
            },
            submittedBy: {
                select: { id: true, name: true, email: true },
            },
        }
    })
    return createReport

}

export const ReportService = {
    create
}