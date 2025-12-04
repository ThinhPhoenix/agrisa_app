import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { claimDataServices } from "../service/claim-event-data.service";

export const useClaim = () => {
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
      queryFn: () => claimDataServices.get.claimEventBasedonRegisteredPolicy(policy_id),
    });
  }
    
  const getClaimsByFarm = (farm_id: string) => {
    return useQuery({
      queryKey: [QueryKey.CLAIM_EVENT.BY_FARM, farm_id],
      queryFn: () => claimDataServices.get.claimEventBasedonFarm(farm_id),
    });
  };

  return {
    getAllClaimData,
    getDetailClaim,
    getClaimsByRegisteredPolicy,
    getClaimsByFarm,
  };
};
