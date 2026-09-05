import { InventoryTxType } from "../../../generated/prisma/enums";

export interface CreateMaterialData {
  companyId: string;
  name: string;
  unit: string;
  currentStock?: number;
  reorderLevel?: number;
}

export interface InventoryTxData {
  materialId: string;
  performedById: string;
  type: InventoryTxType;
  quantity: number;
  note?: string;
  projectId?: string;
}