import type { FormField } from "@/components/custom-form";

interface FormFieldsOptions {
  mode: "create" | "edit";
  ocrResult: any | null;
  hasIrrigation?: boolean; // Để conditional rendering irrigation_type
  isManualMode?: boolean; // Cho phép nhập thủ công không cần OCR
  currentValues?: Record<string, any> | null; // Giá trị hiện tại của form (dùng để đặt minDate động)
}

/**
 * Factory function để tạo form fields cho đăng ký/cập nhật nông trại
 * @param options - Options gồm mode, ocrResult, hasIrrigation, và isManualMode
 * @returns Danh sách form fields
 */
export const createFarmFormFields = ({
  mode,
  ocrResult,
  hasIrrigation = false,
  isManualMode = false,
  currentValues = null,
}: FormFieldsOptions): FormField[] => {
  // Trong create mode, chỉ disable nếu không có OCR result VÀ không phải manual mode
  const shouldDisableField = mode === "create" && !ocrResult && !isManualMode;
  // Nếu ở chế độ `edit` theo yêu cầu chỉ hiển thị 3 field: tên nông trại, ngày gieo, ngày thu hoạch
  if (mode === "edit") {
    return [
      {
        name: "farm_name",
        label: "Tên nông trại",
        placeholder: "VD: Trang trại lúa Đồng Tháp",
        type: "input",
        required: true,
      },
      {
        name: "planting_date",
        label: "Ngày dự kiến gieo trồng",
        placeholder: "Chọn ngày gieo trồng",
        type: "datepicker",
        required: true,
        dateFormat: "DD/MM/YYYY",
        // Không cho chọn ngày quá khứ
        minDate: (() => {
          try {
            return new Date();
          } catch (e) {
            return undefined;
          }
        })(),
        validation: (value: any) => {
          if (!value) return { isValid: false, errorMessage: "Vui lòng chọn ngày gieo trồng" };
          const parts = String(value).split("/");
          if (parts.length !== 3) return { isValid: false, errorMessage: "Ngày không hợp lệ" };
          const [d, m, y] = parts.map((p) => Number(p));
          const picked = new Date(y, m - 1, d);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (picked < today) return { isValid: false, errorMessage: "Ngày gieo trồng không được chọn trong quá khứ" };
          return { isValid: true };
        },
      },
      {
        name: "expected_harvest_date",
        label: "Ngày thu hoạch dự kiến",
        placeholder: "Chọn ngày thu hoạch",
        type: "datepicker",
        required: true,
        dateFormat: "DD/MM/YYYY",
        // Đặt minDate dựa trên planting_date nếu có
        minDate: (() => {
          try {
            const pv = currentValues?.planting_date;
            if (pv && typeof pv === 'string' && pv.includes('/')) {
              const parts = pv.split('/');
              const dd = Number(parts[0]);
              const mm = Number(parts[1]) - 1;
              const yy = Number(parts[2]);
              return new Date(yy, mm, dd + 1);
            }
            // Nếu không có planting_date thì tối thiểu là hôm nay
            const t = new Date();
            t.setDate(t.getDate() + 1);
            return t;
          } catch (e) {
            return undefined;
          }
        })(),
        validation: (value: any, formValues?: Record<string, any>) => {
          if (!value) return { isValid: false, errorMessage: "Vui lòng chọn ngày thu hoạch" };
          // Parse ngày harvest
          const hv = String(value).split('/').map((x) => Number(x));
          if (hv.length !== 3) return { isValid: false, errorMessage: "Ngày không hợp lệ" };
          const harvest = new Date(hv[2], hv[1] - 1, hv[0]);
          const pv = (formValues && formValues.planting_date) || currentValues?.planting_date;
          if (!pv) return { isValid: true };
          const pvParts = String(pv).split('/').map((x) => Number(x));
          if (pvParts.length !== 3) return { isValid: true };
          const plant = new Date(pvParts[2], pvParts[1] - 1, pvParts[0]);
          if (harvest <= plant) return { isValid: false, errorMessage: "Ngày thu hoạch phải lớn hơn ngày gieo trồng" };
          return { isValid: true };
        },
      },
      {
        name: "has_irrigation",
        label: "Có hệ thống tưới tiêu?",
        type: "switch",
        required: false,
        helperText: "Bật nếu nông trại có hệ thống tưới",
      },
      {
        name: "irrigation_type",
        label: "Loại hệ thống tưới",
        placeholder: "VD: Kênh mương, nhỏ giọt, phun mưa...",
        type: "input",
        required: false,
        helperText: "Mô tả loại hệ thống tưới tiêu (nếu có)",
      },
    ];
  }

  return [
    // ===== THÔNG TIN CƠ BẢN =====
    {
      name: "farm_name",
      label: "Tên nông trại",
      placeholder: "VD: Trang trại lúa Đồng Tháp",
      type: "input",
      required: true,
    },

    // ===== VỊ TRÍ ĐỊA LÝ =====
    {
      name: "province",
      label: "Tỉnh/Thành phố",
      placeholder:
        mode === "create" && !isManualMode ? "Tự động từ sổ đỏ" : "Nhập tỉnh",
      type: "input",
      required: true,
      disabled: shouldDisableField,
    },
    {
      name: "district",
      label: "Quận/Huyện",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập quận/huyện",
      type: "input",
      required: true,
      disabled: shouldDisableField,
    },
    {
      name: "commune",
      label: "Phường/Xã",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập phường/xã",
      type: "input",
      required: true,
      disabled: shouldDisableField,
    },
    {
      name: "address",
      label: "Địa chỉ chi tiết",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập địa chỉ đầy đủ",
      type: "textarea",
      required: true,
      disabled: shouldDisableField,
    },

    // ===== THÔNG TIN CANH TÁC =====
    {
      name: "crop_type",
      label: "Loại cây trồng",
      placeholder: "Chọn loại cây trồng",
      type: "select",
      required: true,
      options: [
        { label: "Lúa", value: "rice" },
        { label: "Cà phê", value: "coffee" },
      ],
    },
    {
      name: "area_sqm",
      label: "Diện tích (ha)",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập diện tích",
      type: "number",
      required: true,
      disabled: shouldDisableField,
      helperText: "Đơn vị tính: hecta (ha) - Tự động chuyển đổi từ m²",
    },

    // ===== LỊCH CANH TÁC (TÙY CHỌN) =====
    {
      name: "planting_date",
      label: "Ngày dự kiến gieo trồng",
      placeholder: "Chọn ngày gieo trồng",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
      minDate: (() => {
        try {
          return new Date();
        } catch (e) {
          return undefined;
        }
      })(),
      validation: (value: any) => {
        if (!value) return { isValid: false, errorMessage: "Vui lòng chọn ngày gieo trồng" };
        const parts = String(value).split("/");
        if (parts.length !== 3) return { isValid: false, errorMessage: "Ngày không hợp lệ" };
        const [d, m, y] = parts.map((p) => Number(p));
        const picked = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (picked < today) return { isValid: false, errorMessage: "Ngày gieo trồng không được chọn trong quá khứ" };
        return { isValid: true };
      },
    },
    {
      name: "expected_harvest_date",
      label: "Ngày thu hoạch dự kiến",
      placeholder: "Chọn ngày thu hoạch",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
      minDate: (() => {
        try {
          const pv = currentValues?.planting_date;
          if (pv && typeof pv === 'string' && pv.includes('/')) {
            const parts = pv.split('/');
            const dd = Number(parts[0]);
            const mm = Number(parts[1]) - 1;
            const yy = Number(parts[2]);
            return new Date(yy, mm, dd + 1);
          }
          const t = new Date();
          t.setDate(t.getDate() + 1);
          return t;
        } catch (e) {
          return undefined;
        }
      })(),
      validation: (value: any, formValues?: Record<string, any>) => {
        if (!value) return { isValid: false, errorMessage: "Vui lòng chọn ngày thu hoạch" };
        const hv = String(value).split('/').map((x) => Number(x));
        if (hv.length !== 3) return { isValid: false, errorMessage: "Ngày không hợp lệ" };
        const harvest = new Date(hv[2], hv[1] - 1, hv[0]);
        const pv = (formValues && formValues.planting_date) || currentValues?.planting_date;
        if (!pv) return { isValid: true };
        const pvParts = String(pv).split('/').map((x) => Number(x));
        if (pvParts.length !== 3) return { isValid: true };
        const plant = new Date(pvParts[2], pvParts[1] - 1, pvParts[0]);
        if (harvest <= plant) return { isValid: false, errorMessage: "Ngày thu hoạch phải lớn hơn ngày gieo trồng" };
        return { isValid: true };
      },
    },

    // ===== GIẤY TỞ PHÁP LÝ =====
    {
      name: "land_certificate_number",
      label: "Số giấy chứng nhận đất",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập số sổ đỏ",
      type: "input",
      required: true,
      disabled: shouldDisableField,
    },
    {
      name: "owner_national_id",
      label: "Số CCCD chủ đất",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập số CCCD",
      type: "input",
      required: true,
      disabled: shouldDisableField,
    },

    // ===== THÔNG TIN ĐẤT ĐAI =====
    {
      name: "soil_type",
      label: "Loại đất",
      placeholder:
        mode === "create" && !isManualMode
          ? "Tự động từ sổ đỏ"
          : "Nhập loại đất",
      type: "select",
      required: true,
      disabled: shouldDisableField,
      options: [
        {
          label: "Đất chuyên trồng lúa (LUC)",
          value: "Đất chuyên trồng lúa (LUC)",
        },
        { label: "Đất lúa nương (LUN) ", value: "Đất lúa nương (LUN) " },
        {
          label: "Đất trồng lúa còn lại (LUK)",
          value: "Đất trồng lúa còn lại (LUK)",
        },
        {
          label: "Đất trồng cây lâu năm (CLN)",
          value: "Đất trồng cây lâu năm (CLN)",
        },
      ],
      helperText:
        "Chấp nhận các loại đất dựa trên cây trồng và sổ như sau:\n - Đất chuyên trồng lúa (LUC)\n - Đất trồng lúa còn lại (LUK) \n - Đất lúa nương (LUN) \n - Đất trồng cây lâu năm (CLN)",
    },

    // ===== HỆ THỐNG TƯỚI TIÊU =====
    {
      name: "has_irrigation",
      label: "Có hệ thống tưới tiêu?",
      type: "switch",
      required: true,
      helperText: "Bật nếu nông trại có hệ thống tưới tiêu",
    },

    // Chỉ hiển thị khi has_irrigation = true
    ...(hasIrrigation
      ? [
          {
            name: "irrigation_type",
            label: "Loại hệ thống tưới",
            placeholder: "VD: Kênh mương, nhỏ giọt, phun mưa...",
            type: "input" as const,
            required: false,
            helperText: "Mô tả loại hệ thống tưới tiêu đang sử dụng",
          },
        ]
      : []),

    // ===== TRẠNG THÁI (CHỈ EDIT MODE) =====
    ...(mode === "edit"
      ? [
          {
            name: "status",
            label: "Trạng thái nông trại",
            placeholder: "Chọn trạng thái",
            type: "select" as const,
            required: false,
            options: [
              { label: "Hoạt động", value: "active" },
              { label: "Tạm ngưng", value: "inactive" },
              { label: "Chờ xác minh", value: "pending_verification" },
              { label: "Lưu trữ", value: "archived" },
            ],
          },
        ]
      : []),
  ];
};