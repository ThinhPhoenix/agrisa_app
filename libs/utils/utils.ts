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
      hour: "giờ",
      day: "ngày",
      week: "tuần",
      month: "tháng",
    };
    return labels[unit] || unit;
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
        const [lng, lat] = pair.trim().split(",").map(Number);
        if (isNaN(lng) || isNaN(lat)) throw new Error("Invalid coordinates");
        return [lng, lat];
      });

      if (coords.length < 3) return null; // Polygon cần ít nhất 3 điểm

      // Đảm bảo polygon đóng (điểm đầu = điểm cuối)
      if (
        coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1]
      ) {
        coords.push([...coords[0]]);
      }

      return {
        type: "Polygon",
        coordinates: [coords],
      };
    } catch (error) {
      console.error("❌ Error parsing boundary coordinates:", error);
      return null;
    }
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
};
