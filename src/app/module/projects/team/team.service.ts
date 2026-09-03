import { JwtPayload } from "jsonwebtoken"
import { prisma } from "../../../lib/prisma"

const addMember = async (user:JwtPayload,projectId:string,userId:string)=>{

    const project = await prisma.project.findFirst({
        where:{
            id:projectId,
            companyId:user.companyId,

        },
        select:{
            id:true,
            name:true,
            managerId:true
        }
    })
    if (!project) {
      throw new Error("Project not found");
    }
    const target = await prisma.user.findFirst({
      where: { id: userId, companyId: user.companyId },
      select: { id: true },
    });

    if (!target) {
      throw new Error("User not found");
    }

    const existing = await prisma.projectMember.findUnique({
        where:{
            projectId_userId:{
                projectId,
                userId
            }
        }
    })
    if (existing) {
      throw new Error("User is already a member of this project");
    }
  const member = await prisma.projectMember.create({
    data:{
        projectId,
        userId,
    },
    include:{
        user:{
            select:{
                id:true,
                name:true,
                email:true,
                role:true
            }
        }
    }
})  

await prisma.notification.create({
    data:{
        user:{
            connect:{id: userId}
        },
        type:"PROJECT_ASSIGNMENT",
        title:`Added to project: ${project.name}`,
        message:`You were assigned to project "${project.name}`
    }
})

return member
}


export const TeamService ={
    addMember
}