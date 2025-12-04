import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmPayoutPayload } from "../models/claim-event-data.models";
import { claimDataServices } from "../service/claim-event-data.service";

export const useClaim = () => {
  const queryClient = useQueryClient();

  const getAllClaimData = () => {
    return useQuery({
      queryKey: [QueryKey.CLAIM_EVENT.LIST],
      queryFn: () => claimDataServices.get.claimEventData(),
    });
  };

  const getDetailClaim = (claim_id: string) => {
    return useQuery({
      queryKey: [QueryKey.CLAIM_EVENT.DETAIL, claim_id],
      queryFn: () => claimDataServices.get.claimEventDetailData(claim_id),
    });
  };

  const getClaimsByRegisteredPolicy = (policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.CLAIM_EVENT.BY_POLICY, policy_id],
      queryFn: () =>
        claimDataServices.get.claimEventBasedonRegisteredPolicy(policy_id),
    });
  };

  const getClaimsByFarm = (farm_id: string) => {
    return useQuery({
      queryKey: [QueryKey.CLAIM_EVENT.BY_FARM, farm_id],
      queryFn: () => claimDataServices.get.claimEventBasedonFarm(farm_id),
    });
  };

  /**
   * Mutation để xác nhận đã nhận tiền bồi thường
   */
  const useConfirmPayout = () => {
    return useMutation({
      mutationFn: ({
        claimId,
        payload,
      }: {
        claimId: string;
        payload: ConfirmPayoutPayload;
      }) => claimDataServices.put.confirmPayout(claimId, payload),
      onSuccess: (_, variables) => {
        // Invalidate queries để refresh data
        queryClient.invalidateQueries({
          queryKey: [QueryKey.CLAIM_EVENT.LIST],
        });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.CLAIM_EVENT.DETAIL, variables.claimId],
        });
      },
    });
  };

  return {
    getAllClaimData,
    getDetailClaim,
    getClaimsByRegisteredPolicy,
    getClaimsByFarm,
    useConfirmPayout,
  };
};
