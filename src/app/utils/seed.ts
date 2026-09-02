import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
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
  const company = await prisma.company.upsert({
    where: { slug: COMPANY_SLUG },
    update: { name: COMPANY_NAME },
    create: {
      slug: COMPANY_SLUG,
      name: COMPANY_NAME,
    },
    select: { id: true },
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: ADMIN_EMAIL,
      },
    },
    update: {
      name: ADMIN_NAME,
      passwordHash,
      role: "ADMIN",
    },
    create: {
      companyId: company.id,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`Seed complete: company "${COMPANY_SLUG}" + ADMIN "${ADMIN_EMAIL}".`);
}