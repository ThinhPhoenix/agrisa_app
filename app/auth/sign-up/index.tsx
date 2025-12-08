import { router } from "expo-router";
import { useEffect } from "react";

/**
 * ============================================
 * 📍 SIGN UP INDEX - Redirect to Phone Verification
 * ============================================
 * File này redirect sang màn hình đầu tiên của flow đăng ký
 */
export default function SignUp() {
  useEffect(() => {
    // Redirect to phone verification screen (step 1)
    router.replace("/auth/sign-up/phone-verification");
  }, []);

  return null;
}
