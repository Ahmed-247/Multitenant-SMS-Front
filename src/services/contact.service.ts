import BaseRequestService from "./baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface ContactRequest {
  SchoolName: string;
  SchoolAddress?: string;
  SchoolPhone?: string;
  SchoolEmail: string;
  ContactPersonName?: string;
  Message?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: {
    ContactId: string;
    SchoolName: string;
    SchoolAddress?: string;
    SchoolPhone?: string;
    SchoolEmail: string;
    ContactPersonName?: string;
    Message?: string;
    Status: boolean;
    CreatedAt: string;
  };
}

class ContactService extends BaseRequestService {
  submitContact(data: ContactRequest): Promise<ContactResponse> {
    return this.post(
      `${API_URL}/api/public/contact`, 
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export default new ContactService();
