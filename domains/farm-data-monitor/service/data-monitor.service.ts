import useAxios from "@/config/useAxios.config";
import { MonitoringDataResponse } from "../models/data-monitor.model";

export interface MonitorDataParams {
  parameter_name?: string;
  start_timestamp?: number;
  end_timestamp?: number;
}

export const dataMonitorServices = {
  post: {},

  get: {
    policyDataMonitor: async (
      farmId: string,
      params?: MonitorDataParams
    ): Promise<ApiResponse<MonitoringDataResponse>> => {
      const queryParams = new URLSearchParams();

      if (params?.parameter_name) {
        queryParams.append("parameter_name", params.parameter_name);
      }
      if (params?.start_timestamp) {
        queryParams.append(
          "start_timestamp",
          params.start_timestamp.toString()
        );
      }
      if (params?.end_timestamp) {
        queryParams.append("end_timestamp", params.end_timestamp.toString());
      }

      const queryString = queryParams.toString();
      const url = `/policy/protected/api/v2/policies/read-own/monitoring-data/${farmId}${
        queryString ? `?${queryString}` : ""
      }`;

      return useAxios.get(url);
    },
  },
};

