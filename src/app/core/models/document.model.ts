export interface DocumentTypeModel {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentType {
  title: string;
  description?: string;
  patientId: number;
  documentTypeId: number;
  status: string;
  file: FormData;
}

export interface DocumentModel {
  createdAt: string;
  description: string;
  documentTypeId: number;
  fileSize: string;
  fileUrl: string;
  id: number;
  patientId: number;
  status: string;
  title: string;
  updatedAt: string;
}
