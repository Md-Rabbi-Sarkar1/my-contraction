import { z } from "zod";
import { InventoryTxType } from "../../../generated/prisma/enums";
import { uuidSchema } from "../../validation/common";

export const createMaterialSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
    unit: z.string().trim().min(1, "Unit is required").max(50, "Unit must be at most 50 characters"),
    currentStock: z.coerce.number().nonnegative("Stock must be non-negative").optional(),
    reorderLevel: z.coerce.number().nonnegative("Reorder level must be non-negative").optional(),
  })
  .strict();

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
const inventoryTxTypeSchema = z.enum(InventoryTxType);
export const inventoryTxSchema = z
  .object({
    type: inventoryTxTypeSchema,
    quantity: z.coerce.number().positive("Quantity must be positive"),
    projectId: uuidSchema.optional(),
    note: z.string().max(2000, "Note must be at most 2000 characters").optional(),
  })
  .strict();

export type InventoryTxInput = z.infer<typeof inventoryTxSchema>;