export interface CreateMaterialData {
  companyId: string;
  name: string;
  unit: string;
  currentStock?: number;
  reorderLevel?: number;
}