export const Utils = {
  formatDateForMS: (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    // Chuyển sang GMT+7 (Việt Nam)
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = String(vietnamTime.getUTCDate()).padStart(2, "0");
    const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, "0");
    const year = vietnamTime.getUTCFullYear();
    return `${day}/${month}/${year}`;
  },

  formatDateTimeForMS: (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    // Chuyển sang GMT+7 (Việt Nam)
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = String(vietnamTime.getUTCDate()).padStart(2, "0");
    const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, "0");
    const year = vietnamTime.getUTCFullYear();
    const hours = String(vietnamTime.getUTCHours()).padStart(2, "0");
    const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  formatVietnameseDate: (date: Date): string => {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  },

  formatStringVietnameseDate: (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  },

  formatStringVietnameseDateTime: (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  formatStringVietnameseDateTimeGMT7: (dateString: string): string => {
    const date = new Date(dateString);

    // Chuyển sang GMT+7 (thêm 7 giờ vào UTC)
    const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    const day = String(gmt7Date.getUTCDate()).padStart(2, "0");
    const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, "0");
    const year = gmt7Date.getUTCFullYear();
    const hours = String(gmt7Date.getUTCHours()).padStart(2, "0");
    const minutes = String(gmt7Date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  formatStringVietnameseDateTimeGMT14: (dateString: string): string => {
    const date = new Date(dateString);

    // Chuyển sang GMT+14 (thêm 14 giờ vào UTC)
    const gmt14Date = new Date(date.getTime() + 14 * 60 * 60 * 1000);
    const day = String(gmt14Date.getUTCDate()).padStart(2, "0");
    const month = String(gmt14Date.getUTCMonth() + 1).padStart(2, "0");
    const year = gmt14Date.getUTCFullYear();
    const hours = String(gmt14Date.getUTCHours()).padStart(2, "0");
    const minutes = String(gmt14Date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },

  formatDataCost: (usdCost: number): string => {
    const vndCost = usdCost * 1;
    return (
      new Intl.NumberFormat("vi-VN", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(vndCost) + " ₫"
    );
  },

  formatDuration: (days: number): string => {
    return days >= 30 ? `${Math.floor(days / 30)} tháng` : `${days} ngày`;
  },

  getCropLabel: (cropType: string): string => {
    const labels: Record<string, string> = {
      rice: "Lúa",
      coffee: "Cà phê",
    };
    return labels[cropType] || cropType;
  },

  formatArea: (areaSqm: number): string => {
    const areaHa = (areaSqm / 10000).toFixed(2);
    return `${areaHa} ha`;
  },

  formatAreaDetail: (areaSqm: number): string => {
    const areaHa = (areaSqm / 10000).toFixed(2);
    return `${areaSqm.toLocaleString("vi-VN")} m² / ${areaHa} ha`;
  },

  getOperatorLabel: (operator: string): string => {
    const labels: Record<string, string> = {
      "<": "nhỏ hơn",
      "<=": "nhỏ hơn hoặc bằng",
      ">": "lớn hơn",
      ">=": "lớn hơn hoặc bằng",
      "==": "bằng",
      "!=": "khác",
      AND: "VÀ",
      OR: "HOẶC",
    };
    return labels[operator] || operator;
  },

  getAggregationLabel: (func: string): string => {
    const labels: Record<string, string> = {
      avg: "Trung bình",
      min: "Tối thiểu",
      max: "Tối đa",
      sum: "Tổng",
      median: "Trung vị",
    };
    return labels[func] || func;
  },

  getFrequencyLabel: (unit: string): string => {
    const labels: Record<string, string> = {
      hourly: "Mỗi giờ",
      hour: "giờ",
      daily: "Mỗi ngày",
      day: "ngày",
      weekly: "Mỗi tuần",
      week: "tuần",
      monthly: "Mỗi tháng",
      month: "tháng",
    };
    return labels[unit] || unit;
  },

  // Formatting cho Condition trong Policy Detail
  formatAggregationLabel: (func: string): string => {
    const labels: Record<string, string> = {
      sum: "Tổng cộng",
      avg: "Trung bình",
      min: "Giá trị nhỏ nhất",
      max: "Giá trị lớn nhất",
      median: "Trung vị",
    };
    return labels[func] || func;
  },

  formatThresholdOperator: (op: string): string => {
    const labels: Record<string, string> = {
      "<": "Nhỏ hơn",
      ">": "Lớn hơn",
      "<=": "Nhỏ hơn hoặc bằng",
      ">=": "Lớn hơn hoặc bằng",
      "==": "Bằng",
      "!=": "Khác",
    };
    return labels[op] || op;
  },

  formatBaselineFunction: (func: string): string => {
    const labels: Record<string, string> = {
      avg: "Trung bình",
      median: "Trung vị",
      min: "Giá trị thấp nhất",
      max: "Giá trị cao nhất",
      sum: "Tổng",
    };
    return labels[func] || func;
  },

  convertImageToBase64: async (uri: string): Promise<string> => {
    try {
      // Sử dụng fetch API để convert image sang base64
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove data URL prefix (data:image/jpeg;base64,)
          const base64 = base64data.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("❌ Error converting image to base64:", error);
      throw error;
    }
  },

  /**
   * Parse boundary coordinates từ string format
   * @param coordString - String format: "lng,lat; lng,lat; lng,lat"
   * @returns GeoJSON Polygon object hoặc null nếu invalid
   */
  parseBoundaryCoordinates: (coordString: string): any | null => {
    if (!coordString || typeof coordString !== "string") return null;

    try {
      const coords = coordString.split(";").map((pair: string) => {
        const trimmed = pair.trim();
        if (!trimmed) throw new Error("Empty coordinate pair");

        const parts = trimmed.split(",");
        if (parts.length !== 2) throw new Error("Invalid coordinate format");

        const [x, y] = parts.map((s) => Number(s.trim()));

        if (isNaN(x) || isNaN(y)) {
          console.error(
            `❌ Invalid coordinate values: x=${x}, y=${y} from "${pair}"`
          );
          throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
        }

        return [x, y];
      });

      if (coords.length < 3) {
        console.error(
          `❌ Polygon needs at least 3 points, got ${coords.length}`
        );
        return null;
      }

      // Đảm bảo polygon đóng (điểm đầu = điểm cuối)
      if (
        coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]
      ) {
        coords.push([...coords[0]]);
      }

      console.log(`✅ Parsed ${coords.length} boundary coordinates`);
      return {
        type: "Polygon",
        coordinates: [coords],
      };
    } catch (error) {
      console.error("❌ Error parsing boundary coordinates:", error);
      return null;
    }
  },

  formatTimestamp: (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  },

  /**
   * Parse center location từ lng/lat strings
   * @param lng - Longitude string
   * @param lat - Latitude string
   * @returns GeoJSON Point object hoặc null nếu invalid
   */
  parseCenterLocation: (lng: string, lat: string): any | null => {
    if (!lng || !lat) return null;

    const lngNum = Number(lng);
    const latNum = Number(lat);

    if (isNaN(lngNum) || isNaN(latNum)) return null;

    return {
      type: "Point",
      coordinates: [lngNum, latNum],
    };
  },

  /**
   * Convert GeoJSON boundary coordinates sang string format
   * @param boundary - GeoJSON Polygon object
   * @returns String format: "lng,lat; lng,lat; lng,lat"
   */
  boundaryToString: (boundary: any): string => {
    if (!boundary?.coordinates?.[0]) return "";

    return boundary.coordinates[0]
      .map((coord: number[]) => `${coord[0]},${coord[1]}`)
      .join("; ");
  },

  /**
   * Validate GeoJSON Polygon format
   */
  isValidPolygon: (boundary: any): boolean => {
    if (!boundary?.type || boundary.type !== "Polygon") return false;
    if (!boundary?.coordinates?.[0]) return false;
    if (boundary.coordinates[0].length < 3) return false;

    // Check if coordinates are valid numbers
    return boundary.coordinates[0].every(
      (coord: any) =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === "number" &&
        typeof coord[1] === "number" &&
        !isNaN(coord[0]) &&
        !isNaN(coord[1])
    );
  },

  /**
   * Calculate polygon area in square meters (WGS84)
   * Uses spherical Earth approximation
   */
  calculatePolygonArea: (boundary: any): number => {
    if (!Utils.isValidPolygon(boundary)) return 0;

    const coords = boundary.coordinates[0];
    const R = 6371000; // Earth radius in meters

    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];

      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const lat1Rad = (lat1 * Math.PI) / 180;
      const lat2Rad = (lat2 * Math.PI) / 180;

      area += dLng * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
    }

    area = (area * R * R) / 2;
    return Math.abs(area);
  },

  /**
   * 🌱 Đánh giá trạng thái NDMI (Normalized Difference Moisture Index)
   * @param value - Giá trị NDMI từ -1 đến 1
   * @returns Object chứa label, color (từ AgrisaColors), iconName (lucide), advice
   */
  getNDMIStatus: (
    value: number
  ): {
    label: string;
    color: string;
    iconName: string;
    advice: string;
  } => {
    if (value > 0.4)
      return {
        label: "Rất ẩm",
        color: "info", // Màu xanh dương
        iconName: "droplets",
        advice: "Đất đủ nước, không cần tưới",
      };
    if (value > 0.2)
      return {
        label: "Độ ẩm tốt",
        color: "success", // Màu xanh lá
        iconName: "sprout",
        advice: "Cây trồng phát triển tốt",
      };
    if (value > 0.1)
      return {
        label: "Hơi khô",
        color: "pending", // Màu vàng
        iconName: "alert-triangle",
        advice: "Nên theo dõi, có thể cần tưới",
      };
    if (value > 0)
      return {
        label: "Khô",
        color: "warning", // Màu cam
        iconName: "triangle-alert",
        advice: "Cần tưới nước sớm",
      };
    return {
      label: "Rất khô",
      color: "error", // Màu đỏ
      iconName: "alert-circle",
      advice: "Cần tưới nước ngay!",
    };
  },

  /**
   * 📊 Đánh giá độ tin cậy của dữ liệu vệ tinh dựa trên confidence và cloud cover
   * @param confidence - Độ tin cậy từ 0 đến 1
   * @param cloudCover - Phần trăm mây che (0-100)
   * @returns Object chứa status, message, iconName, color
   */
  getConfidenceExplanation: (
    confidence: number,
    cloudCover: number
  ): {
    status: "low" | "medium" | "high";
    message: string;
    iconName: string;
    color: string;
  } => {
    if (confidence < 0.3) {
      return {
        status: "low",
        message: `Dữ liệu tham khảo (mây che ${Math.round(cloudCover)}%)`,
        iconName: "cloud",
        color: "muted_text",
      };
    }
    if (confidence < 0.7) {
      return {
        status: "medium",
        message: "Dữ liệu khá chính xác",
        iconName: "cloud-sun",
        color: "pending",
      };
    }
    return {
      status: "high",
      message: "Dữ liệu rất chính xác",
      iconName: "sun",
      color: "success",
    };
  },

  /**
   * 🔍 So sánh policy number để kiểm tra tính hợp lệ của monitor data
   * @param monitorPolicyNumber - Policy number từ monitor data response
   * @param detailPolicyNumber - Policy number từ policy detail
   * @returns true nếu khớp, false nếu không khớp
   */
  validateMonitorDataPolicy: (
    monitorPolicyNumber: string | undefined | null,
    detailPolicyNumber: string | undefined | null
  ): boolean => {
    if (!monitorPolicyNumber || !detailPolicyNumber) {
      console.warn("⚠️ Missing policy number for validation");
      return false;
    }

    const isValid = monitorPolicyNumber.trim() === detailPolicyNumber.trim();

    if (!isValid) {
      console.error(
        `❌ Policy number mismatch: Monitor="${monitorPolicyNumber}" vs Detail="${detailPolicyNumber}"`
      );
    }

    return isValid;
  },

  /**
   * 🎯 Kiểm tra xem có nên hiển thị monitor data hay không
   * @param underwritingStatus - Trạng thái underwriting (approved/rejected/pending)
   * @returns true nếu nên hiển thị (approved hoặc rejected)
   */
  shouldShowMonitorData: (
    underwritingStatus: string | undefined | null
  ): boolean => {
    if (!underwritingStatus) return false;

    const status = underwritingStatus.toLowerCase();
    const shouldShow = status === "approved" || status === "rejected";

    console.log(
      `📊 Monitor data display check: status="${status}" → ${shouldShow ? "SHOW" : "HIDE"}`
    );

    return shouldShow;
  },

  /**
   * 💳 Format bank account number với dấu cách
   * @param accountNumber - Số tài khoản ngân hàng
   * @returns Số tài khoản đã format (VD: "1014 2511 3030 1689 4")
   */
  formatBankAccount: (accountNumber: string): string => {
    if (!accountNumber) return "";
    // Thêm dấu cách sau mỗi 4 chữ số
    return accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
  },

  /**
   * 🏦 Lấy tên ngân hàng từ BIN code
   * @param bin - Mã BIN của ngân hàng (6 số đầu)
   * @returns Tên ngân hàng
   */
  getBankName: (bin: string): string => {
    const bankMap: Record<string, string> = {
      "970415": "Vietinbank",
      "970422": "MB Bank",
      "970436": "Vietcombank",
      "970418": "BIDV",
      "970405": "Agribank",
      "970407": "Techcombank",
      "970432": "VPBank",
      "970423": "TPBank",
      "970403": "Sacombank",
      "970437": "HDBank",
      "970441": "VIB",
      "970454": "VietCapital Bank",
      "970429": "SCB",
      "970448": "OCB",
      "970409": "BacA Bank",
      "970416": "ACB",
      "970438": "BVBank",
      "970440": "SeABank",
      "970443": "SHB",
      "970431": "Eximbank",
      "970426": "MSB",
      "970414": "Oceanbank",
      "970433": "VietBank",
      "970439": "Public Bank",
      "970458": "UOB",
      "970452": "VietinBank - Chi nhánh",
    };

    return bankMap[bin] || "Ngân hàng";
  },

  /**
   * ⏰ Format thời gian hết hạn payment
   * @param expiredAt - ISO 8601 timestamp
   * @returns Object chứa formatted time và remaining minutes
   */
  formatPaymentExpiry: (
    expiredAt: string
  ): {
    formattedTime: string;
    remainingMinutes: number;
    isExpired: boolean;
  } => {
    const expiryDate = new Date(expiredAt);
    const now = new Date();
    const remainingMs = expiryDate.getTime() - now.getTime();
    const remainingMinutes = Math.floor(remainingMs / 60000);

    return {
      formattedTime: expiryDate.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      remainingMinutes,
      isExpired: remainingMinutes <= 0,
    };
  },

  /**
   * 📝 Generate payment description
   * @param policyNumber - Số hợp đồng
   * @returns Mô tả thanh toán
   */
  generatePaymentDescription: (policyNumber: string): string => {
    return `TT ${policyNumber}`;
  },

  /**
   * 🔢 Format order code để dễ đọc
   * @param orderCode - Mã đơn hàng
   * @returns Order code đã format
   */
  formatOrderCode: (orderCode: number): string => {
    return orderCode.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },

  /**
   * ⏱️ Countdown timer cho payment expiry
   * @param remainingMinutes - Số phút còn lại
   * @returns Object chứa hours, minutes, color, message
   */
  getPaymentCountdown: (
    remainingMinutes: number
  ): {
    hours: number;
    minutes: number;
    color: string;
    message: string;
  } => {
    if (remainingMinutes <= 0) {
      return {
        hours: 0,
        minutes: 0,
        color: "error",
        message: "Đã hết hạn",
      };
    }

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    let color = "success";
    let message = "Còn nhiều thời gian";

    if (remainingMinutes <= 5) {
      color = "error";
      message = "Sắp hết hạn!";
    } else if (remainingMinutes <= 10) {
      color = "warning";
      message = "Cần thanh toán sớm";
    }

    return { hours, minutes, color, message };
  },

  /**
   * 💳 Lấy nhãn loại thanh toán
   * @param type - Loại payment (policy_registration_payment, hopdong, etc.)
   * @returns Nhãn tiếng Việt
   */
  getPaymentTypeLabel: (type: string): string => {
    const typeMap: Record<string, string> = {
      policy_registration_payment: "Thanh toán phí bảo hiểm",
      hopdong: "Thanh toán hợp đồng",
      contract: "Thanh toán hợp đồng",
    };
    return typeMap[type] || "Thanh toán";
  },

  // ============================================
  // 🏷️ BADGE UTILITIES
  // ============================================

  /**
   * 🏷️ Lấy config cho Badge component
   * @param variant - Loại badge: 'success' | 'error' | 'warning' | 'info' | 'default'
   * @param colors - Object chứa các màu từ useAgrisaColors
   * @returns Object chứa backgroundColor và textColor
   */
  getBadgeConfig: (
    variant: "success" | "error" | "warning" | "info" | "default",
    colors: {
      success: string;
      successSoft: string;
      error: string;
      errorSoft: string;
      warning: string;
      warningSoft: string;
      info: string;
      infoSoft: string;
      muted_text: string;
      card_surface: string;
    }
  ): { backgroundColor: string; textColor: string } => {
    const configs = {
      success: {
        backgroundColor: colors.successSoft,
        textColor: colors.success,
      },
      error: { backgroundColor: colors.errorSoft, textColor: colors.error },
      warning: {
        backgroundColor: colors.warningSoft,
        textColor: colors.warning,
      },
      info: { backgroundColor: colors.infoSoft, textColor: colors.info },
      default: {
        backgroundColor: colors.card_surface,
        textColor: colors.muted_text,
      },
    };
    return configs[variant] || configs.default;
  },

  /**
   * 🏷️ Lấy variant cho badge dựa trên giá trị boolean
   * @param isActive - Trạng thái active/verified
   * @returns 'success' nếu true, 'error' nếu false
   */
  getBadgeVariantFromBoolean: (isActive: boolean): "success" | "error" => {
    return isActive ? "success" : "error";
  },

  /**
   * 🏷️ Lấy variant cho badge dựa trên trạng thái
   * @param status - Trạng thái: 'active' | 'inactive' | 'pending' | 'verified' | 'unverified'
   * @returns Variant tương ứng
   */
  getBadgeVariantFromStatus: (
    status: string
  ): "success" | "error" | "warning" | "info" | "default" => {
    const statusMap: Record<
      string,
      "success" | "error" | "warning" | "info" | "default"
    > = {
      active: "success",
      verified: "success",
      completed: "success",
      inactive: "error",
      unverified: "error",
      failed: "error",
      pending: "warning",
      processing: "warning",
      info: "info",
    };
    return statusMap[status.toLowerCase()] || "default";
  },
};
