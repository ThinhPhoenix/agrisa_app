/**
 * 🔍 Monitor Data Helper - Utilities cho xử lý dữ liệu giám sát
 * 
 * File này chứa các helper functions để:
 * - Validate monitor data với policy
 * - Filter monitor data theo policy number, data_source_id, registered_policy_id
 * - Format và display monitor data
 * - Lọc dữ liệu theo các trigger conditions từ base policy
 */

import { MonitoringDataItem, MonitoringDataResponse } from "@/domains/farm-data-monitor/models/data-monitor.model";
import { Utils } from "@/libs/utils/utils";

export class MonitorDataHelper {
  /**
   * 🎯 Filter monitoring data items theo policy number cụ thể
   * @param monitorData - Response data từ API
   * @param policyNumber - Policy number cần filter
   * @returns Array các monitoring items khớp với policy number
   */
  static filterByPolicyNumber(
    monitorData: MonitoringDataResponse | null | undefined,
    policyNumber: string | undefined
  ): MonitoringDataItem[] {
    if (!monitorData || !policyNumber) {
      console.warn("⚠️ Missing monitorData or policyNumber for filtering");
      return [];
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      console.log("📊 No monitoring data available");
      return [];
    }

    const filteredItems = monitorData.monitoring_data.filter(
      (item) => item.policy_number === policyNumber
    );

    console.log(
      `🔍 Filtered monitoring data: ${filteredItems.length}/${monitorData.monitoring_data.length} items match policy "${policyNumber}"`
    );

    return filteredItems;
  }

  /**
   * 🆔 Filter monitoring data items theo data_source_id
   * Dùng để lọc dữ liệu theo nguồn dữ liệu từ trigger condition của base policy
   * @param monitorData - Response data từ API
   * @param dataSourceId - ID của data source cần filter
   * @returns Array các monitoring items khớp với data_source_id
   */
  static filterByDataSourceId(
    monitorData: MonitoringDataResponse | null | undefined,
    dataSourceId: string | undefined
  ): MonitoringDataItem[] {
    if (!monitorData || !dataSourceId) {
      console.warn("⚠️ Missing monitorData or dataSourceId for filtering");
      return [];
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      console.log("📊 No monitoring data available");
      return [];
    }

    const filteredItems = monitorData.monitoring_data.filter(
      (item) => item.data_source_id === dataSourceId
    );

    console.log(
      `🔍 Filtered by data_source_id: ${filteredItems.length}/${monitorData.monitoring_data.length} items match "${dataSourceId}"`
    );

    return filteredItems;
  }

  /**
   * 📋 Filter monitoring data items theo nhiều data_source_ids
   * Lọc theo danh sách data source ids từ các trigger conditions của base policy
   * @param monitorData - Response data từ API
   * @param dataSourceIds - Array các data_source_id cần filter
   * @returns Array các monitoring items khớp với bất kỳ data_source_id nào
   */
  static filterByMultipleDataSourceIds(
    monitorData: MonitoringDataResponse | null | undefined,
    dataSourceIds: string[] | undefined
  ): MonitoringDataItem[] {
    if (!monitorData || !dataSourceIds || dataSourceIds.length === 0) {
      console.warn("⚠️ Missing monitorData or dataSourceIds for filtering");
      return [];
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      console.log("📊 No monitoring data available");
      return [];
    }

    const dataSourceIdSet = new Set(dataSourceIds);
    const filteredItems = monitorData.monitoring_data.filter((item) =>
      dataSourceIdSet.has(item.data_source_id)
    );

    console.log(
      `🔍 Filtered by multiple data_source_ids: ${filteredItems.length}/${monitorData.monitoring_data.length} items match ${dataSourceIds.length} sources`
    );

    return filteredItems;
  }

  /**
   * 🏢 Filter monitoring data items theo registered_policy_id
   * @param monitorData - Response data từ API
   * @param registeredPolicyId - ID của registered policy cần filter
   * @returns Array các monitoring items khớp với registered_policy_id
   */
  static filterByRegisteredPolicyId(
    monitorData: MonitoringDataResponse | null | undefined,
    registeredPolicyId: string | undefined
  ): MonitoringDataItem[] {
    if (!monitorData || !registeredPolicyId) {
      console.warn(
        "⚠️ Missing monitorData or registeredPolicyId for filtering"
      );
      return [];
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      console.log("📊 No monitoring data available");
      return [];
    }

    const filteredItems = monitorData.monitoring_data.filter(
      (item) => item.registered_policy_id === registeredPolicyId
    );

    console.log(
      `🔍 Filtered by registered_policy_id: ${filteredItems.length}/${monitorData.monitoring_data.length} items match "${registeredPolicyId}"`
    );

    return filteredItems;
  }

  /**
   * 🎯 Filter monitoring data items theo parameter_name
   * Lọc theo tên tham số giám sát (ndmi, ndvi, etc.)
   * @param monitorData - Response data từ API
   * @param parameterName - Tên parameter cần filter
   * @returns Array các monitoring items khớp với parameter_name
   */
  static filterByParameterName(
    monitorData: MonitoringDataResponse | null | undefined,
    parameterName: string | undefined
  ): MonitoringDataItem[] {
    if (!monitorData || !parameterName) {
      console.warn("⚠️ Missing monitorData or parameterName for filtering");
      return [];
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      console.log("📊 No monitoring data available");
      return [];
    }

    const filteredItems = monitorData.monitoring_data.filter(
      (item) =>
        item.parameter_name.toLowerCase() === parameterName.toLowerCase()
    );

    console.log(
      `🔍 Filtered by parameter_name: ${filteredItems.length}/${monitorData.monitoring_data.length} items match "${parameterName}"`
    );

    return filteredItems;
  }

  /**
   * 🏷️ Lấy danh sách data_source_ids duy nhất từ monitor data
   * @param monitorData - Response data từ API
   * @returns Array các data_source_id không trùng lặp
   */
  static getUniqueDataSourceIds(
    monitorData: MonitoringDataResponse | null | undefined
  ): string[] {
    if (!monitorData?.monitoring_data) return [];

    const uniqueIds = Array.from(
      new Set(
        monitorData.monitoring_data
          .map((item) => item.data_source_id)
          .filter((id) => id && id.trim() !== "")
      )
    );

    return uniqueIds;
  }

  /**
   * 🏷️ Lấy danh sách parameter_names duy nhất từ monitor data
   * @param monitorData - Response data từ API
   * @returns Array các parameter_name không trùng lặp
   */
  static getUniqueParameterNames(
    monitorData: MonitoringDataResponse | null | undefined
  ): string[] {
    if (!monitorData?.monitoring_data) return [];

    const uniqueNames = Array.from(
      new Set(
        monitorData.monitoring_data
          .map((item) => item.parameter_name)
          .filter((name) => name && name.trim() !== "")
      )
    );

    return uniqueNames;
  }

  /**
   * 🏷️ Lấy danh sách registered_policy_ids duy nhất từ monitor data
   * @param monitorData - Response data từ API
   * @returns Array các registered_policy_id không trùng lặp
   */
  static getUniqueRegisteredPolicyIds(
    monitorData: MonitoringDataResponse | null | undefined
  ): string[] {
    if (!monitorData?.monitoring_data) return [];

    const uniqueIds = Array.from(
      new Set(
        monitorData.monitoring_data
          .map((item) => item.registered_policy_id)
          .filter((id) => id && id.trim() !== "")
      )
    );

    return uniqueIds;
  }

  /**
   * 📋 Validate toàn bộ monitor data với policy
   * @param monitorData - Response data từ API
   * @param policyNumber - Policy number cần validate
   * @returns Object chứa validation result và filtered items
   */
  static validateMonitorData(
    monitorData: MonitoringDataResponse | null | undefined,
    policyNumber: string | undefined
  ): {
    isValid: boolean;
    matchedItems: MonitoringDataItem[];
    totalItems: number;
    matchCount: number;
    errors: string[];
  } {
    const result = {
      isValid: false,
      matchedItems: [] as MonitoringDataItem[],
      totalItems: 0,
      matchCount: 0,
      errors: [] as string[],
    };

    // Validate inputs
    if (!monitorData) {
      result.errors.push("Monitor data is null or undefined");
      return result;
    }

    if (!policyNumber) {
      result.errors.push("Policy number is missing");
      return result;
    }

    if (
      !monitorData.monitoring_data ||
      monitorData.monitoring_data.length === 0
    ) {
      result.errors.push("No monitoring data items available");
      return result;
    }

    // Filter items by policy number
    result.totalItems = monitorData.monitoring_data.length;
    result.matchedItems = this.filterByPolicyNumber(monitorData, policyNumber);
    result.matchCount = result.matchedItems.length;

    // Validation logic
    if (result.matchCount === 0) {
      result.errors.push(
        `No monitoring data found for policy "${policyNumber}". Available policies: ${this.getUniquePolicyNumbers(monitorData).join(", ")}`
      );
      result.isValid = false;
    } else {
      result.isValid = true;
      console.log(
        `✅ Valid monitor data: ${result.matchCount} items for policy "${policyNumber}"`
      );
    }

    return result;
  }

  /**
   * 🏷️ Lấy danh sách policy numbers duy nhất từ monitor data
   * @param monitorData - Response data từ API
   * @returns Array các policy numbers không trùng lặp
   */
  static getUniquePolicyNumbers(
    monitorData: MonitoringDataResponse | null | undefined
  ): string[] {
    if (!monitorData?.monitoring_data) return [];

    const uniquePolicies = Array.from(
      new Set(
        monitorData.monitoring_data
          .map((item) => item.policy_number)
          .filter((pn) => pn && pn.trim() !== "")
      )
    );

    return uniquePolicies;
  }

  /**
   * 📊 Lấy thống kê monitor data theo policy
   * @param monitorData - Response data từ API
   * @param policyNumber - Policy number cần thống kê
   * @returns Object chứa các metrics
   */
  static getMonitoringStats(
    monitorData: MonitoringDataResponse | null | undefined,
    policyNumber: string | undefined
  ): {
    totalCount: number;
    avgNDMI: number;
    avgConfidence: number;
    latestTimestamp: string | null;
    dataQuality: {
      good: number;
      fair: number;
      poor: number;
    };
  } {
    const filteredItems = this.filterByPolicyNumber(monitorData, policyNumber);

    if (filteredItems.length === 0) {
      return {
        totalCount: 0,
        avgNDMI: 0,
        avgConfidence: 0,
        latestTimestamp: null,
        dataQuality: { good: 0, fair: 0, poor: 0 },
      };
    }

    // Calculate averages
    const totalNDMI = filteredItems.reduce(
      (sum, item) => sum + item.measured_value,
      0
    );
    const totalConfidence = filteredItems.reduce(
      (sum, item) => sum + item.confidence_score,
      0
    );

    // Data quality count
    const dataQuality = {
      good: filteredItems.filter((item) => item.data_quality === "good").length,
      fair: filteredItems.filter((item) => item.data_quality === "fair").length,
      poor: filteredItems.filter((item) => item.data_quality === "poor").length,
    };

    // Latest timestamp
    const timestamps = filteredItems
      .map((item) => new Date(item.created_at))
      .sort((a, b) => b.getTime() - a.getTime());

    return {
      totalCount: filteredItems.length,
      avgNDMI: totalNDMI / filteredItems.length,
      avgConfidence: totalConfidence / filteredItems.length,
      latestTimestamp: timestamps[0]?.toISOString() || null,
      dataQuality,
    };
  }

  /**
   * 🎨 Format monitor data item để hiển thị
   * @param item - Monitoring data item
   * @returns Object chứa formatted data với colors, icons, messages
   */
  static formatMonitorItem(item: MonitoringDataItem): {
    ndmiStatus: ReturnType<typeof Utils.getNDMIStatus>;
    confidenceInfo: ReturnType<typeof Utils.getConfidenceExplanation>;
    formattedValue: string;
    formattedTimestamp: string;
    qualityLabel: string;
    qualityColor: string;
  } {
    const ndmiStatus = Utils.getNDMIStatus(item.measured_value);
    const confidenceInfo = Utils.getConfidenceExplanation(
      item.confidence_score,
      item.cloud_cover_percentage
    );

    // Quality label mapping
    const qualityMap: Record<string, { label: string; color: string }> = {
      good: { label: "Tốt", color: "success" },
      fair: { label: "Trung bình", color: "pending" },
      poor: { label: "Kém", color: "error" },
    };

    const quality = qualityMap[item.data_quality] || {
      label: "Không xác định",
      color: "muted_text",
    };

    return {
      ndmiStatus,
      confidenceInfo,
      formattedValue: item.measured_value.toFixed(3),
      formattedTimestamp: Utils.formatTimestamp(item.created_at),
      qualityLabel: quality.label,
      qualityColor: quality.color,
    };
  }

  /**
   * ⚠️ Log chi tiết validation errors
   * @param errors - Array các error messages
   * @param policyNumber - Policy number đang validate
   */
  static logValidationErrors(
    errors: string[],
    policyNumber: string | undefined
  ): void {
    if (errors.length === 0) return;

    console.group(`❌ Monitor Data Validation Errors for "${policyNumber}"`);
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.groupEnd();
  }

  /**
   * 📈 Check xem có nên hiển thị monitoring section không
   * @param validationResult - Kết quả từ validateMonitorData
   * @param underwritingStatus - Trạng thái underwriting của policy
   * @returns true nếu nên hiển thị
   */
  static shouldDisplayMonitoring(
    validationResult: ReturnType<typeof MonitorDataHelper.validateMonitorData>,
    underwritingStatus: string | undefined
  ): boolean {
    // Kiểm tra underwriting status
    if (!Utils.shouldShowMonitorData(underwritingStatus)) {
      console.log(
        `🚫 Monitoring hidden: underwriting status is "${underwritingStatus}"`
      );
      return false;
    }

    // Kiểm tra validation
    if (!validationResult.isValid) {
      this.logValidationErrors(validationResult.errors, undefined);
      return false;
    }

    // Kiểm tra có data không
    if (validationResult.matchCount === 0) {
      console.log("🚫 Monitoring hidden: no matching data items");
      return false;
    }

    console.log(
      `✅ Monitoring displayed: ${validationResult.matchCount} valid items`
    );
    return true;
  }

  /**
   * 🔗 Trích xuất danh sách data_source_ids từ triggers của base policy
   * Dùng để lọc monitoring data theo các nguồn dữ liệu của policy
   * @param triggers - Array các triggers từ base policy
   * @returns Array các data_source_id từ conditions của triggers
   */
  static extractDataSourceIdsFromTriggers(
    triggers:
      | Array<{
          conditions?: Array<{ data_source_id: string }>;
        }>
      | null
      | undefined
  ): string[] {
    if (!triggers || triggers.length === 0) {
      return [];
    }

    const dataSourceIds = triggers
      .flatMap((trigger) => trigger.conditions || [])
      .map((condition) => condition.data_source_id)
      .filter((id) => id && id.trim() !== "");

    // Loại bỏ trùng lặp
    return Array.from(new Set(dataSourceIds));
  }

  /**
   * 📊 Nhóm monitoring data theo data_source_id
   * @param monitorData - Response data từ API
   * @returns Object với key là data_source_id và value là array monitoring items
   */
  static groupByDataSourceId(
    monitorData: MonitoringDataResponse | null | undefined
  ): Record<string, MonitoringDataItem[]> {
    if (!monitorData?.monitoring_data) return {};

    return monitorData.monitoring_data.reduce(
      (acc, item) => {
        const key = item.data_source_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, MonitoringDataItem[]>
    );
  }

  /**
   * 📊 Nhóm monitoring data theo parameter_name
   * @param monitorData - Response data từ API
   * @returns Object với key là parameter_name và value là array monitoring items
   */
  static groupByParameterName(
    monitorData: MonitoringDataResponse | null | undefined
  ): Record<string, MonitoringDataItem[]> {
    if (!monitorData?.monitoring_data) return {};

    return monitorData.monitoring_data.reduce(
      (acc, item) => {
        const key = item.parameter_name;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, MonitoringDataItem[]>
    );
  }

  /**
   * 📊 Nhóm monitoring data theo registered_policy_id
   * @param monitorData - Response data từ API
   * @returns Object với key là registered_policy_id và value là array monitoring items
   */
  static groupByRegisteredPolicyId(
    monitorData: MonitoringDataResponse | null | undefined
  ): Record<string, MonitoringDataItem[]> {
    if (!monitorData?.monitoring_data) return {};

    return monitorData.monitoring_data.reduce(
      (acc, item) => {
        const key = item.registered_policy_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, MonitoringDataItem[]>
    );
  }

  /**
   * 🔍 Lọc và validate monitoring data theo base policy triggers
   * Dùng khi cần lọc data theo các nguồn dữ liệu được định nghĩa trong policy
   * @param monitorData - Response data từ API
   * @param triggers - Array các triggers từ base policy
   * @param registeredPolicyId - ID của registered policy (optional, thêm filter)
   * @returns Object chứa filtered items và metadata
   */
  static filterByPolicyTriggers(
    monitorData: MonitoringDataResponse | null | undefined,
    triggers:
      | Array<{
          conditions?: Array<{ data_source_id: string }>;
        }>
      | null
      | undefined,
    registeredPolicyId?: string
  ): {
    items: MonitoringDataItem[];
    dataSourceIds: string[];
    parameterNames: string[];
    matchCount: number;
  } {
    const dataSourceIds = this.extractDataSourceIdsFromTriggers(triggers);

    if (dataSourceIds.length === 0) {
      return {
        items: [],
        dataSourceIds: [],
        parameterNames: [],
        matchCount: 0,
      };
    }

    // Lọc theo data_source_ids từ triggers
    let filteredItems = this.filterByMultipleDataSourceIds(
      monitorData,
      dataSourceIds
    );

    // Nếu có registeredPolicyId, lọc thêm
    if (registeredPolicyId) {
      filteredItems = filteredItems.filter(
        (item) => item.registered_policy_id === registeredPolicyId
      );
    }

    // Lấy danh sách parameter_names từ filtered items
    const parameterNames = Array.from(
      new Set(filteredItems.map((item) => item.parameter_name))
    );

    return {
      items: filteredItems,
      dataSourceIds,
      parameterNames,
      matchCount: filteredItems.length,
    };
  }
}
