import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface SchoolAdminStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

export interface SchoolAdminStatsResponse {
  success: boolean;
  data: SchoolAdminStats;
  message: string;
}

class SchoolAdminDashboardService extends BaseRequestService {
  // Get school admin statistics
  getSchoolAdminStats(): Promise<SchoolAdminStatsResponse> {
    return this.get(`${API_URL}/api/school-admin/stats`);
  }
}

export default new SchoolAdminDashboardService();
