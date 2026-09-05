import { JwtPayload } from "jsonwebtoken"
import { CreateMaterialInput } from "./material.validation"
import { CreateMaterialData } from "./material.interface"
import { prisma } from "../../lib/prisma";

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

export const MeterialService ={
    create
}