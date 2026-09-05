export interface CreateDocumentData {
  projectId: string;
  uploadedById: string;
  name: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  storageKey?: string;
}