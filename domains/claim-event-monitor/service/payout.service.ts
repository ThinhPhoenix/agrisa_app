import useAxios from "@/config/useAxios.config";
import { ConfirmPayoutPayload, Payout } from "../models/payout.model";

export const payoutService = {
  put: {
    /**
     * Xác nhận đã nhận tiền bồi thường
     * @param payoutId - ID của payout (không phải claim_id)
     * @param payload - Thông tin xác nhận từ nông dân
     */
    confirmPayout: async (
      payoutId: string,
      payload: ConfirmPayoutPayload
    ): Promise<ApiResponse<any>> => {
      return useAxios.put(
        `/policy/protected/api/v2/payouts/update/confirm/${payoutId}`,
        payload
      );
    },
  },

  get: {
    /**
     * Lấy thông tin payout theo claim ID
     * @param claimId - ID của claim
     */
    getPayoutByClaimId: async (claimId: string): Promise<ApiResponse<Payout>> => {
      return useAxios.get(
        `/policy/protected/api/v2/payouts/read-own/by-claim/${claimId}`
      );
    },
  },
};
