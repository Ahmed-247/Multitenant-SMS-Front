import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface School {
  SchoolId: number;
  SchoolName: string;
  SchoolAddress?: string;
  SchoolPhone?: string;
  SchoolEmail?: string;
  StudentLimit?: number;
  users?: {
    UserId: number;
    UserName: string;
    Email: string;
    Role: string;
  }[];
}

export interface CreateSchoolRequest {
  SchoolName: string;
  SchoolAddress?: string;
  SchoolPhone?: string;
  SchoolEmail?: string;
  StudentLimit?: number;
  AdminName: string;
  AdminEmail: string;
  AdminPassword: string;
}

export interface CreateSchoolResponse {
  success: boolean;
  message: string;
  data: {
    school: School;
    admin: {
      UserId: number;
      UserName: string;
      Email: string;
      Role: string;
      SchoolId: number;
    };
  };
}

export interface SchoolsResponse {
  success: boolean;
  message: string;
  count: number;
  data: School[];
}

class SchoolService extends BaseRequestService {
  // Get all schools
  getAllSchools(): Promise<SchoolsResponse> {
    return this.get(`${API_URL}/api/schools`);
  }

  // Get schools with their admin users
  getSchoolsWithAdmins(): Promise<SchoolsResponse> {
    return this.get(`${API_URL}/api/schools/with-admins`);
  }

  // Get school by ID
  getSchoolById(id: number): Promise<{ success: boolean; message: string; data: School }> {
    return this.get(`${API_URL}/api/schools/${id}`);
  }

  // Create a new school with admin
  createSchoolWithAdmin(data: CreateSchoolRequest): Promise<CreateSchoolResponse> {
    return this.post(`${API_URL}/api/schools`, data);
  }

  // Update school
  updateSchool(id: number, data: Partial<CreateSchoolRequest>): Promise<{ success: boolean; message: string; data: School }> {
    return this.put(`${API_URL}/api/schools/${id}`, data);
  }

  // Delete school
  deleteSchool(id: number): Promise<{ success: boolean; message: string; data: { SchoolId: number; SchoolName: string } }> {
    return this.delete(`${API_URL}/api/schools/${id}`);
  }
}

export default new SchoolService();
