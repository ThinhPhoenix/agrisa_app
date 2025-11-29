import useAxios from "@/config/useAxios.config";
import { MonitoringDataResponse } from "../models/data-monitor.model";


export const dataMonitorServices = {
  post: {},

  get: {
    policyDataMonitor: async (
      farmId: string
    ): Promise<ApiResponse<MonitoringDataResponse>> => {
      return useAxios.get(
        `/policy/protected/api/v2/policies/read-own/monitoring-data/${farmId}`
      );
    },
  },
};

