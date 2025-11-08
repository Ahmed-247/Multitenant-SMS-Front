import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface EbookContent {
  id?: number;
  no?: string | null;
  titre?: string | null;
  auteur?: string | null;
  description?: string | null;
}

export interface BulkUploadRequest {
  content: Array<{
    no?: string;
    titre?: string;
    auteur?: string;
    description?: string;
  }>;
}

export interface EbookContentResponse {
  success: boolean;
  message: string;
  count: number;
  data: EbookContent[];
}

class EbookService extends BaseRequestService {
  getEbookContent(): Promise<EbookContentResponse> {
    return this.get(`${API_URL}/api/superadmin/ebook-content`);
  }

  bulkUploadEbookContent(data: BulkUploadRequest): Promise<EbookContentResponse> {
    return this.post(`${API_URL}/api/superadmin/ebook-content/bulk-upload`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default new EbookService();

