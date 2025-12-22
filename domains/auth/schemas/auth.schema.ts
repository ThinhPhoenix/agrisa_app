import { z } from "zod";

// Pattern mới: 0XXXXXXXXX (10 số, bắt đầu bằng 0, số thứ 2 là 3,5,7,8,9)
const REGEX_PHONE_VN = /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
const REGEX_PASSWORD =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_NATIONAL_ID = /^\d{12}$/;

// Helper function to validate age between 18-80
const validateAge = (dateString: string) => {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }
  return age;
};

// Helper function để detect type của identifier
const detectIdentifierType = (value: string): "phone" | "email" | "invalid" => {
  const trimmed = value.trim();

  // Check phone first (ngắn hơn, dễ match)
  if (REGEX_PHONE_VN.test(trimmed)) {
    return "phone";
  }

  // Check email
  if (REGEX_EMAIL.test(trimmed)) {
    return "email";
  }

  return "invalid";
};

export const signInSchema = z.object({
  // Single unified field cho cả phone và email
  identifier: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại hoặc email")
    .refine(
      (val) => {
        const type = detectIdentifierType(val);
        return type !== "invalid";
      },
      {
        message:
          "Số điện thoại hoặc email không hợp lệ. Ví dụ: 0901234567 hoặc ten@email.com",
      }
    ),

  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    ,
});

export const signUpSchema = z
  .object({
    phone: z
      .string()
      .regex(
        REGEX_PHONE_VN,
        "Số điện thoại Việt Nam không hợp lệ. VD: 0901234567"
      ),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(
        REGEX_PASSWORD,
        "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
      ),
    confirmPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(
        REGEX_PASSWORD,
        "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
      ),
    national_id: z.string().regex(REGEX_NATIONAL_ID, "CCCD phải có đúng 12 số"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type SignInPayloadSchema = z.infer<typeof signInSchema>;
export type SignUpPayloadSchema = z.infer<typeof signUpSchema>;

export type AuthPayload = SignInPayloadSchema & Partial<SignUpPayloadSchema>;

// ============================================
// USER PROFILE SCHEMA - Chỉnh sửa thông tin cá nhân
// ============================================

export const userProfileSchema = z.object({
  // Thông tin cơ bản - BẮT BUỘC
  full_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  display_name: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự"),
  date_of_birth: z.string().min(1, "Vui lòng chọn ngày sinh"),
  gender: z.enum(["M", "F"], { message: "Vui lòng chọn giới tính" }),
  nationality: z.string().min(1, "Vui lòng nhập quốc tịch"),

  // Liên hệ - BẮT BUỘC
  primary_phone: z
    .string()
    .regex(REGEX_PHONE_VN, "Số điện thoại không hợp lệ. VD: 0901234567"),
  alternate_phone: z
    .string()
    .regex(REGEX_PHONE_VN, "Số điện thoại phụ không hợp lệ")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),

  // Địa chỉ - BẮT BUỘC
  permanent_address: z
    .string()
    .min(5, "Địa chỉ thường trú phải có ít nhất 5 ký tự"),
  current_address: z
    .string()
    .min(5, "Địa chỉ hiện tại phải có ít nhất 5 ký tự"),

  // Mã hành chính - BẮT BUỘC
  province_code: z.string().min(1, "Vui lòng nhập mã tỉnh"),
  province_name: z.string().min(1, "Vui lòng nhập tên tỉnh"),
  district_code: z.string().min(1, "Vui lòng nhập mã quận/huyện"),
  district_name: z.string().min(1, "Vui lòng nhập tên quận/huyện"),
  ward_code: z.string().min(1, "Vui lòng nhập mã phường/xã"),
  ward_name: z.string().min(1, "Vui lòng nhập tên phường/xã"),
  postal_code: z.string().optional().or(z.literal("")),

  // Thông tin ngân hàng - để nhận bồi thường bảo hiểm
  account_number: z
    .string()
    .min(8, "Số tài khoản phải có ít nhất 8 ký tự")
    .max(20, "Số tài khoản không được quá 20 ký tự")
    .optional()
    .or(z.literal("")),
  account_name: z
    .string()
    .min(2, "Tên chủ tài khoản phải có ít nhất 2 ký tự")
    .optional()
    .or(z.literal("")),
  bank_code: z
    .string()
    .min(6, "Mã ngân hàng phải có 6 ký tự")
    .max(6, "Mã ngân hàng phải có 6 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UserProfileFormSchema = z.infer<typeof userProfileSchema>;
