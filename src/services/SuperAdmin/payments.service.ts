import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface Payment {
  PaymentId: string;
  PaymentStatus: string;
  notif_token: string;
  txnid: string;
  Order_id: string;
  Amount: string;
  PaymentTime: string;
  SchoolId: string;
  UserId: string;
  school: {
    SchoolName: string;
    StudentLimit: string;
    PlanExpiryDate: string | null;
  };
}

export interface PaymentsResponse {
  success: boolean;
  message: string;
  data: {
    totalPayments: number;
    totalSuccessfulPayments: number;
    totalCollectiveAmount: string;
    payments: Payment[];
  };
}

class PaymentsService extends BaseRequestService {
  // Get all payments for SuperAdmin
  getAllPayments(): Promise<PaymentsResponse> {
    return this.get(`${API_URL}/api/superadmin/payments`);
  }
}

export default new PaymentsService();
