import { JwtPayload } from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { IcreateProjectSchema } from "./project.interface"

const create = async(user:JwtPayload,payload:IcreateProjectSchema) =>{
if(payload.managerId !== undefined){
    const manager = await prisma.user.findFirst({
        where:{
            id:payload.managerId,
            companyId: user.companyId
        },
        select:{
            id:true,
            role:true
        }
    })
          if (!manager) {
        throw new Error("Manager not found");
      }
      if(manager.role !== "PROJECT_MANAGER"){
        throw new Error("This provided user are not Manager")
      }

}

const createProject = await prisma.project.create({
    data:{
        companyId:user.companyId,
        name: payload.name,
    description:payload.description, 
    location: payload.location,
    clientInfo:payload.clientInfo,
    startDate: payload.startDate,
    expectedEndDate: payload.expectedEndDate,
    budget: payload.budget,
    managerId:payload.managerId,
    }
})

return createProject


}

export const ProjectService ={
    create
}