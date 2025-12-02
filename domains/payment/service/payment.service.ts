import useAxios from "@/config/useAxios.config";
import { PaymentDetailResponse, PaymentListResponse } from "../models/payment.model";


export const paymentService = {
  post: {
   
  },

  get: {
    getAllPayment: async (): Promise<ApiResponse<PaymentListResponse>> => {
      return useAxios.get(`/payment/protected/orders`);
    },
    getDetailPayment: async (payment_id: string): Promise<ApiResponse<PaymentDetailResponse>> => {
      return useAxios.get(`/payment/protected/order/${payment_id}`);
    }
  },
};