import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface SchoolProfile {
  SchoolName: string;
  SchoolAddress: string;
  SchoolPhone: string;
  SchoolEmail: string;
  TotalStudents: number;
  AdminName: string | null;
  AdminEmail: string | null;
}

export interface SchoolProfileResponse {
  success: boolean;
  message: string;
  data: SchoolProfile;
}

export interface EditSchoolProfileRequest {
  SchoolName?: string;
  SchoolAddress?: string;
  SchoolPhone?: string;
  TotalStudents?: number;
}

class SchoolProfileService extends BaseRequestService {
  // Get school profile (for school admin - uses token to get their school)
  getSchoolProfile(): Promise<SchoolProfileResponse> {
    return this.get(`${API_URL}/api/school-admin/profile`);
  }

  // Edit school profile (school admin can only edit name, address, phone)
  editSchoolProfile(data: EditSchoolProfileRequest): Promise<SchoolProfileResponse> {
    return this.put(`${API_URL}/api/school-admin/profile`, data);
  }
}

export default new SchoolProfileService();
