import { z } from "zod";

const REGEX_PHONE_VN = /^(\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
// const REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
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
const detectIdentifierType = (value: string): 'phone' | 'email' | 'invalid' => {
  const trimmed = value.trim();
  
  // Check phone first (ngắn hơn, dễ match)
  if (REGEX_PHONE_VN.test(trimmed)) {
    return 'phone';
  }
  
  // Check email
  if (REGEX_EMAIL.test(trimmed)) {
    return 'email';
  }
  
  return 'invalid';
};

export const signInSchema = z
  .object({
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
            "Số điện thoại hoặc email không hợp lệ. Ví dụ: +84901234567 hoặc ten@email.com",
        }
      ),

    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      // .regex(
      //   REGEX_PASSWORD,
      //   "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
      // ),
  });


export const signUpSchema = z
  .object({
    phone: z
      .string()
      .regex(
        REGEX_PHONE_VN,
        "Số điện thoại Việt Nam không hợp lệ. VD: +84901234567"
      ),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu"),
    national_id: z.string().regex(REGEX_NATIONAL_ID, "CCCD phải có đúng 12 số"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type SignInPayloadSchema = z.infer<typeof signInSchema>;
export type SignUpPayloadSchema = z.infer<typeof signUpSchema>;

export type AuthPayload = SignInPayloadSchema & Partial<SignUpPayloadSchema>;
