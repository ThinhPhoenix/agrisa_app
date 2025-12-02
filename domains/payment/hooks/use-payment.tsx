import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../service/payment.service";

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

  return {
    getAllPayment,
  };
};
