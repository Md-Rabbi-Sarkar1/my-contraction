import { z } from "zod";

export const uuidSchema = z.string().uuid("Id must be a valid UUID");

export const dateSchema = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Date must be a valid ISO date",
  });