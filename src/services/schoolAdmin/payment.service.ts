import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface PaymentStatus {
  schoolId: number;
  schoolName: string;
  paymentStatus: boolean;
  paymentAmount: number;
  planExpiryDate: string;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  isActive: boolean;
}

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data: PaymentStatus;
}

export interface PaymentInitiationResponse {
  status: number;
  message: string;
  pay_token: string;
  payment_url: string;
  notif_token: string;
  paymentId: string;
}

export interface PaymentHistoryItem {
  paymentId: number;
  status: string;
  transactionId: string;
  orderId: string;
  amount: string;
  paymentTime: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    schoolId: number;
    schoolName: string;
    totalPayments: number;
    payments: PaymentHistoryItem[];
  };
}

class PaymentService extends BaseRequestService {
  // Get payment status for the authenticated school
  getPaymentStatus(): Promise<PaymentStatusResponse> {
    return this.get(`${API_URL}/api/payment/status`);
  }

  // Initiate payment with Orange Money
  initiatePayment(): Promise<PaymentInitiationResponse> {
    return this.post(`${API_URL}/api/orange/pay`);
  }

  // Get payment history for the authenticated school
  getPaymentHistory(): Promise<PaymentHistoryResponse> {
    return this.get(`${API_URL}/api/payment/history`);
  }
}

export default new PaymentService();
