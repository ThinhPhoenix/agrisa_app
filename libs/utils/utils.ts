export const Utils = {
  formatDateForMS: (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  formatVietnameseDate: (date: Date): string => {
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
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
};
