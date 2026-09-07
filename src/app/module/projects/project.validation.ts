import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .trim(),
  
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .trim(),
  
  location: z
    .string()
    .min(1, { message: "Location is required" })
    .trim(),
  
  clientInfo: z
    .string()
    .trim()
    .optional(),
  
  // Validates as an optional YYYY-MM-DD date string.
  startDate: z
    .string()
    .date({ message: "Invalid start date format (expected YYYY-MM-DD)" })
    .optional(),
  
  // Validates as an optional YYYY-MM-DD date string.
  expectedEndDate: z
    .string()
    .date({ message: "Invalid expected end date format (expected YYYY-MM-DD)" })
    .optional(),
  
  // Kept as a string since your interface defines it as a string.
  budget: z
    .string()
    .trim()
    .optional(),
  
  managerId: z
    .string()
    .min(1, { message: "Manager ID is required" })
    .trim(),
});

// Extract the TypeScript type from the schema
export type TCreateProjectSchema = z.infer<typeof createProjectSchema>;
