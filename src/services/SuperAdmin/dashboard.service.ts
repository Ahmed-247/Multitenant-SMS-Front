import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface School {
  id: string;
  name: string;
}

export interface DashboardStats {
  allowedStudents: number; // From StudentLimit (sum across schools)
  totalStudents: number; // From TotalStudents column (sum across schools)
  activeStudents: number;
  totalRevenue: number;
  averageRevenue: number;
  contentDownloads: number;
  sessions: number;
  duration: number;
  schools: School[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

class DashboardService extends BaseRequestService {
  // Get dashboard statistics with optional school filter
  getDashboardStats(schoolId?: string): Promise<DashboardResponse> {
    const params = schoolId && schoolId !== 'all' ? `?schoolId=${schoolId}` : '';
    return this.get(`${API_URL}/api/stats/dashboard${params}`);
  }
}

export default new DashboardService();
