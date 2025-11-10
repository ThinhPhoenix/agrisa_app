export const Utils = {
  formatDateForMS: (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        hour: "giờ",
        day: "ngày",
        week: "tuần",
        month: "tháng",
      };
      return labels[unit] || unit;
    },
};
