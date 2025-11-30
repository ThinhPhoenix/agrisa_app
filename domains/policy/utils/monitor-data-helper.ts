/**
 * 🔍 Monitor Data Helper - Utilities cho xử lý dữ liệu giám sát
 * 
 * File này chứa các helper functions để:
 * - Validate monitor data với policy
 * - Filter monitor data theo policy number
 * - Format và display monitor data
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

    if (!monitorData.monitoring_data || monitorData.monitoring_data.length === 0) {
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

    if (!monitorData.monitoring_data || monitorData.monitoring_data.length === 0) {
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
      this.logValidationErrors(
        validationResult.errors,
        undefined
      );
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
}
