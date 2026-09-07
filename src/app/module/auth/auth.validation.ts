import { z } from 'zod';
export const CompanyRoleSchema = z.enum(['ADMIN', 'USER', 'MANAGER']); 
export const registerPayloadSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters long" })
    .trim(),
  
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters long" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug must contain only lowercase letters, numbers, and hyphens" })
    .trim(),
  
  user: z.object({
    name: z
    	.string()
    	.min(2, { message: "Name must be at least 2 characters long" })
    	.trim(),
    
    email: z
    	.string()
    	.email({ message: "Invalid email address" })
    	.trim()
    	.toLowerCase(),
    

    paassword: z
    	.string()
    	.min(6, { message: "Password must be at least 6 characters long" }),  
      
     
role: z.literal('ADMIN', { message: "Role must be exactly ADMIN during registration" }),


  }),
});

export type TRegisterPayload = z.infer<typeof registerPayloadSchema>;


export const verifyEmailPayloadSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),
  
  otp: z
    .string()
    .min(1, { message: "OTP code is required" })
    // If your OTP is strictly a 6-digit number, uncomment the line below:
    // .length(6, { message: "OTP must be exactly 6 digits" })
    // .regex(/^\d+$/, { message: "OTP must contain only numbers" })
    .trim(),
});

// Extract the TypeScript type from the schema
export type TVerifyEmailPayload = z.infer<typeof verifyEmailPayloadSchema>;
