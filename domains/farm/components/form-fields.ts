import type { FormField } from "@/components/custom-form";

interface FormFieldsOptions {
  mode: "create" | "edit";
  ocrResult: any | null;
}

/**
 * Factory function để tạo form fields cho đăng ký/cập nhật nông trại
 * @param options - Options gồm mode và ocrResult
 * @returns Danh sách form fields
 */
export const createFarmFormFields = ({
  mode,
  ocrResult,
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
      label: "Diện tích (m²)",
      placeholder: mode === "create" ? "Tự động từ sổ đỏ" : "Nhập diện tích",
      type: "number",
      required: true,
      disabled: mode === "create" && !ocrResult,
      helperText: "Đơn vị tính: mét vuông (m²)",
    },

    // ===== LỊCH CANH TÁC =====
    {
      name: "planting_date",
      label: "Ngày gieo trồng",
      placeholder: "Chọn ngày gieo trồng",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
    },
    {
      name: "expected_harvest_date",
      label: "Ngày thu hoạch dự kiến",
      placeholder: "Chọn ngày thu hoạch",
      type: "datepicker",
      required: true,
      dateFormat: "DD/MM/YYYY",
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
      placeholder: "Chọn loại đất",
      type: "select",
      required: true,
      options: [
        { label: "Đất phù sa", value: "alluvial" },
        { label: "Đất sét", value: "clay" },
        { label: "Đất cát", value: "sandy" },
        { label: "Đất thịt", value: "loam" },
        { label: "Đất than bùn", value: "peat" },
        { label: "Khác", value: "other" },
      ],
    },

    // ===== HỆ THỐNG TƯỚI TIÊU =====
    {
      name: "has_irrigation",
      label: "Có hệ thống tưới tiêu?",
      type: "switch",
      required: true,
    },
    {
      name: "irrigation_type",
      label: "Loại hệ thống tưới",
      placeholder: "Chọn loại hệ thống",
      type: "select",
      required: false,
      options: [
        { label: "Kênh mương", value: "canal" },
        { label: "Nhỏ giọt", value: "drip" },
        { label: "Phun mưa", value: "sprinkler" },
        { label: "Máy bơm", value: "pump" },
        { label: "Nước mưa", value: "rain_fed" },
        { label: "Không có", value: "Không có" },
      ],
    },

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