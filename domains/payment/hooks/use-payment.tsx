import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { paymentService, PaymentType } from "../service/payment.service";

/**
 * Hook quản lý payment queries
 */
export const usePayment = () => {
  const getAllPayment = () => {
    return useQuery({
      queryKey: [QueryKey.PAYMENT.GET_ALL_PAYMENT],
      queryFn: () => paymentService.get.getAllPayment(),
    });
  };

  const getDetailPayment = (payment_id: string) => {
    return useQuery({
      queryKey: [QueryKey.PAYMENT.GET_DETAIL_PAYMENT, payment_id],
      queryFn: () => paymentService.get.getDetailPayment(payment_id),
    });
  };

  /**
   * Lấy tổng số tiền theo loại payment
   * @param type - Loại payment (policy_registration_payment, policy_payout_payment, etc.)
   */
  const getTotalByType = (type: PaymentType) => {
    return useQuery({
      queryKey: [QueryKey.PAYMENT.GET_TOTAL_BY_TYPE, type],
      queryFn: () => paymentService.get.getTotalByType(type),
    });
  };

  return {
    getAllPayment,
    getDetailPayment,
    getTotalByType,
  };
};
