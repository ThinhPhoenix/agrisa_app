import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmPayoutPayload, Payout } from "../models/payout.model";
import { payoutService } from "../service/payout.service";

export const usePayout = () => {
  const queryClient = useQueryClient();

  /**
   * Lấy thông tin payout theo claim ID
   */
  const getPayoutByClaimId = (claimId: string) => {
    return useQuery<ApiResponse<Payout>>({
      queryKey: [QueryKey.PAYOUT.GET_PAYOUT_BY_CLAIM_ID, claimId],
      queryFn: () => payoutService.get.getPayoutByClaimId(claimId),
      enabled: !!claimId, // Chỉ fetch khi có claimId
    });
  };

  /**
   * Mutation để xác nhận đã nhận tiền chi trả
   * Sử dụng payout_id thay vì claim_id
   */
  const useConfirmPayout = () => {
    return useMutation({
      mutationFn: ({
        payoutId,
        payload,
      }: {
        payoutId: string;
        payload: ConfirmPayoutPayload;
      }) => payoutService.put.confirmPayout(payoutId, payload),
      onSuccess: (_, variables) => {
        // Invalidate queries để refresh data
        queryClient.invalidateQueries({
          queryKey: [QueryKey.CLAIM_EVENT.LIST],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.PAYOUT.GET_PAYOUT_BY_CLAIM_ID],
        });
      },
    });
  };

  return {
    getPayoutByClaimId,
    useConfirmPayout,
  };
};