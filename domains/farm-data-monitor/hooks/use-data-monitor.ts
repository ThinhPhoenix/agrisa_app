import { QueryKey } from "@/domains/shared/stores/query-key";
import { useQuery } from "@tanstack/react-query";
import {
  dataMonitorServices,
  MonitorDataParams,
} from "../service/data-monitor.service";

export const useDataMonitor = () => {


  const getPolicyDataMonitor = (farmId: string, params?: MonitorDataParams) => {
    return useQuery({
      queryKey: [QueryKey.DATA_MONITOR.POLICY_MONITOR, farmId, params],
      queryFn: () => dataMonitorServices.get.policyDataMonitor(farmId, params),
      enabled: !!farmId,
    });
  };

    return {
      getPolicyDataMonitor,
    };
};
