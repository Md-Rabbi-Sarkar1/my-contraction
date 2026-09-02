import { AuthProvider, CompanyRole } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { hashPassword } from "./password";
const COMPANY_SLUG = "demo-construction";
const COMPANY_NAME = "Demo Construction Co.";
const ADMIN_EMAIL = "admin@demo.local";
const ADMIN_NAME = "Alex Admin";
const ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? "Password123!";
const SALT_ROUNDS = 12;
export const seedAdmin = async () =>{  
    const existCompany = await prisma.company.findUnique({
    where: { slug: COMPANY_SLUG },
    select: { id: true },

  });
if(existCompany){
    console.log("Admin already exists!")
    return
}    
const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const result = await prisma.company.create({
    data:{
      name: COMPANY_NAME,
      slug:COMPANY_SLUG,
      users:{
        create:{
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          passwordHash,
          role: CompanyRole.ADMIN,
          authProvider: AuthProvider.CREDENTIAL,
          emailVerified: true,
        }
      }
    },
    select:{
      id:true,
      name:true,
      users:{
        select:{
          id:true,
          email:true
        }
      }
    }
  });
  
  console.log(`Seed complete: company "${COMPANY_SLUG}" + ADMIN "${ADMIN_EMAIL}".`);
return result
}