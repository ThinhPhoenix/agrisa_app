import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import { dataMonitorServices } from "../service/data-monitor.service";

export const useDataMonitor = () => {


  const getPolicyDataMonitor = (farmId: string) => {
    return useQuery({
      queryKey: [QueryKey.DATA_MONITOR.POLICY_MONITOR, farmId],
      queryFn: () =>
        dataMonitorServices.get.policyDataMonitor(farmId),
      enabled: !!farmId,
    });
  };

    return {
      getPolicyDataMonitor,
    };
};
