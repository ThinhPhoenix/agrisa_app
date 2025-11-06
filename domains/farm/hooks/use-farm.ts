import { useToast } from "@/domains/shared/hooks/useToast";
import { QueryKey } from "@/domains/shared/stores/query-key";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { policyServices } from "../service/farm.service";

export const usePolicy = () => {

  const getPublicBasePolicy = () => {
    return useQuery({
      queryKey: [QueryKey.EKYC.STATUS],
      queryFn: () => policyServices.get.base_policy(),
    });
  }

  const getDetailBasePolicy = (base_policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.POLICY.DETAIL, base_policy_id],
      queryFn: () => policyServices.get.detail_policy(base_policy_id),
      enabled: !!base_policy_id,
    });
  };
  

  return {
    getPublicBasePolicy,
    getDetailBasePolicy,
  };
};
