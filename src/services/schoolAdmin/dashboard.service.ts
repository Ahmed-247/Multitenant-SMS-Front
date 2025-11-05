import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface SchoolAdminStats {
  allowedStudents: number; // From StudentLimit
  totalStudents: number; // From TotalStudents
  activeStudents: number;
  inactiveStudents: number;
  contentDownloads?: number;
  sessions?: number;
  duration?: number;
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

  // Get student statistics by school id (capacity, active, inactive)
  getStudentStatsBySchool(schoolId: number): Promise<SchoolAdminStatsResponse> {
    return this.get(`${API_URL}/api/school-admin/stats/${schoolId}`);
  }
}

export default new SchoolAdminDashboardService();
