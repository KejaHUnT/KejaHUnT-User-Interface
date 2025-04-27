export interface FileResponse {
    base64: string;   // Updated field name from `base64` to `base64Content`
    fileName: string;
    extension: string;
    createdAt: string;       // New field for the creation timestamp
    createdBy: string;       // New field for the creator's name
  }
  