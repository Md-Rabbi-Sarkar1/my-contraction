import { CompanyRole } from "../../../generated/prisma/enums";

export interface InviteUserInput {
    email: string;
    role: CompanyRole
    name: string;
}
export interface IaccepteInviteData {
    token:string,
    name:string,
    password:string
}