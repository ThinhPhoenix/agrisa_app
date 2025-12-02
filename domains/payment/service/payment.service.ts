import useAxios from "@/config/useAxios.config";
import { PaymentListResponse } from "../models/payment.model";


export const paymentService = {
  post: {
   
  },

  get: {
    getAllPayment: async (): Promise<ApiResponse<PaymentListResponse>> => {
      return useAxios.get(`/payment/protected/orders`);
    },
  },
};