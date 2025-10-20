import BaseRequestService from "./baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;


export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      UserId: string;
      UserName: string;
      Email: string;
      Role: 'superadmin' | 'admin' | 'user';
    };
    token: string;
  };
}

class AuthService extends BaseRequestService {
  loginUser(data: LoginRequest): Promise<LoginResponse> {
    return this.post(`${API_URL}/api/auth/login`, data);
  }

 
}

export default new AuthService();
