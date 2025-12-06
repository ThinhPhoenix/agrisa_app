import useAxios from "@/config/useAxios.config";
import { PaymentDetailResponse, PaymentListResponse } from "../models/payment.model";

// Payment types
export type PaymentType = 
  | "policy_registration_payment"
  | "policy_payout_payment" 
  | "policy_compensation_payment"
  | "policy_renewal_payment";

export const paymentService = {
  post: {
   
  },

  get: {
    getAllPayment: async (): Promise<ApiResponse<PaymentListResponse>> => {
      return useAxios.get(`/payment/protected/orders`);
    },
    getDetailPayment: async (payment_id: string): Promise<ApiResponse<PaymentDetailResponse>> => {
      return useAxios.get(`/payment/protected/order/${payment_id}`);
    },
    getTotalByType: async (type: PaymentType): Promise<ApiResponse<number>> => {
      return useAxios.get(`/payment/protected/total?type=${type}`);
    },
  },
};