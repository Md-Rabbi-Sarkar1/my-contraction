import { JwtPayload } from "jsonwebtoken"
import { IaccepteInviteData, InviteUserInput } from "./user.interface"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError"
import { generateInviteToken, hashInviteToken } from "../../utils/invitation-token"
import { hashPassword } from "../../utils/password"
const INVITATION_EXPIRY_DAYS = 7;

const invite = async(user: JwtPayload,payload :InviteUserInput)=>{
const existing = await prisma.user.findFirst({
    where:{
        companyId : user.conpanyId,
        email :payload.email,
    },
    select:{
        id: true
    }
})
if(existing){
    throw new Error("A user with this email already exists in the company")
}
const token = generateInviteToken();
const tokenHash = hashInviteToken(token);
const expiresAt =new Date();
expiresAt.setDate(expiresAt.getDate() +INVITATION_EXPIRY_DAYS)

const invitation = await prisma.invitation.create({
    data:{
        companyId:user.companyId,
        email:payload.email,
        role:payload.role,
        tokenHash,
        expiresAt
    },
    // select:{
    //    companyId:true,
    //    email:true,
    //    role:true
    // }
})
return {
    invitation,
    token
}
}

const acceptInvite = async(payload :IaccepteInviteData)=>{
const tokenHash = hashInviteToken(payload.token);
const invitation = await prisma.invitation.findFirst({
    where:{
        tokenHash,
        status:"PENDING"
    }
})
if(!invitation){
    throw new Error("Invitation not found or already used")
}
    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }


    const passwordHash = await hashPassword(payload.password)

const created = await prisma.user.create({
    data:{
        companyId:invitation.companyId,
        name: payload.name,
        email: invitation.email,
        passwordHash,
        role:invitation.role,
        emailVerified:true
    },
    select:{
        id:true,
        companyId:true
    }
})
await prisma.invitation.update({
    where:{
        id:invitation.id
    },
    data:{
        status:"ACCEPTED",
        acceptedAt: new Date()
    }
})
return {
    companyId:created.companyId,
    userId:created.id
}
}



export const UserService ={
    invite,
    acceptInvite
}