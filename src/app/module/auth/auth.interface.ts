import { CompanyRole } from "../../../generated/prisma/enums";

export interface ILoginUserPayload {
	email: string;
	password: string;
}
export interface IGoogleLoginPayload {
	idToken: string;
}

export interface IRegisterPayload {
	companyName: string;
	slug:string;
	user:{
		name :string;
		email:string;
		paassword:string;
		role:CompanyRole;
	}

}

export interface IVerifyEmailPayload {
	email: string;
	otp : string;
}