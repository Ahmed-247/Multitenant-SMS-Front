import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface Contact {
  ContactId: string;
  SchoolName: string;
  SchoolAddress?: string;
  SchoolPhone?: string;
  SchoolEmail: string;
  ContactPersonName?: string;
  Message?: string;
  Status: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ContactsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Contact[];
}

class ContactsService extends BaseRequestService {
  getAllContacts(): Promise<ContactsResponse> {
    return this.get(`${API_URL}/api/superadmin/contacts`);
  }
}

export default new ContactsService();
