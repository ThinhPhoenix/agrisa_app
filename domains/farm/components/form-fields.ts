import type { FormField } from "@/components/custom-form";

interface FormFieldsOptions {
  mode: "create" | "edit";
  ocrResult: any | null;
  hasIrrigation?: boolean; // Để conditional rendering irrigation_type
}

/**
 * Factory function để tạo form fields cho đăng ký/cập nhật nông trại
 * @param options - Options gồm mode và ocrResult
 * @returns Danh sách form fields
 */
export const createFarmFormFields = ({
  mode,
  ocrResult,
  hasIrrigation = false,
}: FormFieldsOptions): FormField[] => {
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
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập tỉnh",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "district",
      label: "Quận/Huyện",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập quận/huyện",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "commune",
      label: "Phường/Xã",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập phường/xã",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "address",
      label: "Địa chỉ chi tiết",
      placeholder:
        mode === "create" ? "Tự động từ sổ đỏ" : "Nhập địa chỉ đầy đủ",
      type: "textarea",
      required: true,
      disabled: mode === "create" && !ocrResult,
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
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập diện tích",
      type: "number",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText: "Đơn vị tính: hecta (ha) - Tự động chuyển đổi từ m²",
    },

    // ===== LỊCH CANH TÁC (TÙY CHỌN) =====
    {
      name: "planting_date",
      label: "Ngày gieo trồng (không bắt buộc)",
      placeholder: "Chọn ngày gieo trồng",
      type: "datepicker",
      required: false,
      dateFormat: "DD/MM/YYYY",
      helperText: "Có thể bỏ trống nếu chưa xác định",
    },
    {
      name: "expected_harvest_date",
      label: "Ngày thu hoạch dự kiến (không bắt buộc)",
      placeholder: "Chọn ngày thu hoạch",
      type: "datepicker",
      required: false,
      dateFormat: "DD/MM/YYYY",
      helperText: "Có thể bỏ trống nếu chưa xác định",
    },

    // ===== GIẤY TỞ PHÁP LÝ =====
    {
      name: "land_certificate_number",
      label: "Số giấy chứng nhận đất",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập số sổ đỏ",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },
    {
      name: "owner_national_id",
      label: "Số CCCD chủ đất",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập số CCCD",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
    },

    // ===== THÔNG TIN ĐẤT ĐAI =====
    {
      name: "soil_type",
      label: "Loại đất",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập loại đất",
      type: "input",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText:
        "Chấp nhận các loại đất dựa trên cây trồng và sổ như sau:\n - Đất chuyên trồng lúa nước (LUC)\n - Đất trồng lúa nước còn lại (LUK) \n - Đất lúa nương (LUN) \n - Đất trồng cây lâu năm (CLN)",
    },

    // ===== HỆ THỐNG TƯỚI TIÊU =====
    {
      name: "has_irrigation",
      label: "Có hệ thống tưới tiêu?",
      type: "switch",
      required: true,
      helperText: "Bật nếu trang trại có hệ thống tưới tiêu",
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