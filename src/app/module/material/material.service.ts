import { JwtPayload } from "jsonwebtoken"
import { CreateMaterialInput, InventoryTxInput } from "./material.validation"
import { CreateMaterialData, InventoryTxData } from "./material.interface"
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

const create = async (user:JwtPayload,payload:CreateMaterialInput)=>{
const data: CreateMaterialData ={
      companyId: user.companyId,
      name: payload.name,
      unit: payload.unit,
    };
    if (payload.currentStock !== undefined) data.currentStock = payload.currentStock;
    if (payload.reorderLevel !== undefined) data.reorderLevel = payload.reorderLevel;

const createMeterial = await prisma.material.create({
    data:{
        company:{
            connect:{
                id:data.companyId
            }
        },
        name:data.name,
        unit:data.unit
    },
    include:{
         _count: { select: { transactions: true } }
    }
})
return createMeterial

}
const recordTransaction = async (user: JwtPayload, id: string, payload: InventoryTxInput) => {
    const material = await prisma.material.findFirst({
        where: {
            id,
            companyId: user.companyId
        },
        include: {
            _count: { select: { transactions: true } },
        }
    });

    if (!material) {
        throw new Error("Material not found");
    }

    if (payload.type === "USAGE" && payload.quantity > Number(material.currentStock)) {
        throw new Error("Insufficient stock for this transaction");
    }

    if (payload.projectId !== undefined) {
        const project = await prisma.project.findFirst({
            where: { id: payload.projectId, companyId: user.companyId },
            select: { id: true },
        });
        if (!project) {
            throw new Error("Project not found");
        }
    }

    const data: InventoryTxData = {
        materialId: id,
        performedById: user.userId,
        type: payload.type,
        quantity: payload.quantity,
    };
    if (payload.note !== undefined) data.note = payload.note;
    if (payload.projectId !== undefined) data.projectId = payload.projectId;

    const result = await prisma.$transaction(async (tx) => {
        await tx.material.findFirstOrThrow({
            where: {
                id: id,
                companyId: user.companyId
            }
        });

        const delta = data.type === "USAGE" ? -data.quantity : data.quantity;
        
        
        const updated = await tx.material.update({
            where: {  id },
            data: {
                currentStock: {
                    increment: delta
                }
            },
            include: {
                _count: { select: { transactions: true } },
            }
        });

       
        const createData: Prisma.InventoryTransactionCreateInput = {
            material: { connect: { id: data.materialId } },
            performedBy: { connect: { id: data.performedById } },
            type: data.type,
            quantity: data.quantity,
        };
        if (data.note !== undefined) createData.note = data.note;
        if (data.projectId !== undefined) createData.project = { connect: { id: data.projectId } };

        const txRecord = await tx.inventoryTransaction.create({
            data: createData,
            include: {
                material: { select: { id: true, name: true, unit: true } },
            }
        });

        
        const isLowStock = (current: Prisma.Decimal, reorder: Prisma.Decimal | null) => {
            if (!reorder) return false;
            return reorder.gt(0) && current.lte(reorder);
        };

   
        if (isLowStock(updated.currentStock, material.reorderLevel)) {
            
            const managers = await tx.user.findMany({
                where: {
                    companyId: user.companyId,
                    role: { in: ["ADMIN", "PROJECT_MANAGER"] }
                },
                select: { id: true }
            });

            const managerIds = managers.map(m => m.id);
            for (const userId of new Set(managerIds)) {
                await tx.notification.create({
                    data: {
                        user: { connect: { id: userId } },
                        type: "LOW_STOCK",
                        title: `Low stock: ${material.name}`,
                        
                        message: `Material "${material.name}" stock is low: ${updated.currentStock} ${material.unit} remaining (reorder level: ${material.reorderLevel}).`
                    }
                });
            }
        }

        return { tx: txRecord, material: updated };
    }, {
        maxWait: 10000,
        timeout: 30000,
    });

    return {
        transaction: result.tx,
        material: result.material
    };
};


export const MeterialService ={
    create,
    recordTransaction
}