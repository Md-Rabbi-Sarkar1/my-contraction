import { JwtPayload } from "jsonwebtoken";
import { CreateDocumentInput } from "./document.validation";
import { prisma } from "../../lib/prisma";
import { CreateDocumentData } from "./document.interface";
import { connect } from "node:http2";

const create = async (user: JwtPayload, payload: CreateDocumentInput) => {
    const data: CreateDocumentData = {
        projectId: payload.projectId,
        uploadedById: user.userId,
        name: payload.name,
        type: payload.type,
        mimeType: payload.mimeType,
        sizeBytes: payload.sizeBytes,
    };
    if (payload.storageKey !== undefined) { data.storageKey = payload.storageKey };

    const createDocument = await prisma.document.create({
        data: {
            project: {
                connect: {
                    id: data.projectId
                }
            },
            uploadedBy: {
                connect: {
                    id: data.uploadedById
                }
            },
            name: data.name,
            type: data.type,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
            storageKey: data.storageKey
        },
        include: {
            project: { select: { id: true, name: true } },
            uploadedBy: { select: { id: true, name: true, email: true } }
        }
    })
    return createDocument
}

export const DocumentService = {
    create
}