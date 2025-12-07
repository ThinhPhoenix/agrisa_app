import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { insurancePartnerService } from "../service/insurance-partner.service";

export const useInsurancePartner = () => {

    const getInsurancePartner = () => {
    return useQuery({
        queryKey: [QueryKey.INSURANCE_PARTNER.VIEW_ALL],
        queryFn: () => insurancePartnerService.get.getInsurancePartner(),
        enabled: true,
    });
    };

  const getInsurancePartnerDetail = (base_policy_id: string) => {
    return useQuery({
      queryKey: [QueryKey.INSURANCE_PARTNER.DETAIL, base_policy_id],
      queryFn: () =>
        insurancePartnerService.get.getInsurancePartnerByID(base_policy_id),
      enabled: !!base_policy_id,
    });
  };

    return {
      getInsurancePartner,
    getInsurancePartnerDetail,
  };
};
