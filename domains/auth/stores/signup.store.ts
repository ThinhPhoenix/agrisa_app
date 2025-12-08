import { create } from "zustand";

/**
 * ============================================
 * 📝 SIGNUP STORE - Quản lý dữ liệu đăng ký
 * ============================================
 * Store này lưu trữ tạm thời dữ liệu trong quá trình đăng ký
 * với flow: Phone -> OTP -> Email -> CCCD -> Password
 */

export interface SignUpFormData {
  phone: string;
  phoneVerified: boolean;
  email: string;
  national_id: string; // CCCD
  password: string;
  confirmPassword: string;
}

interface SignUpState {
  // Dữ liệu form
  formData: SignUpFormData;
  
  // OTP Management
  otpSentCount: number; // Số lần đã gửi OTP
  lastOtpSentTime: number | null; // Timestamp lần gửi OTP cuối
  isOtpBlocked: boolean; // Block khi gửi quá 5 lần
  
  // Actions
  setPhone: (phone: string) => void;
  setPhoneVerified: (verified: boolean) => void;
  setEmail: (email: string) => void;
  setNationalId: (nationalId: string) => void;
  setPassword: (password: string, confirmPassword: string) => void;
  
  // OTP Actions
  incrementOtpCount: () => void;
  updateLastOtpTime: () => void;
  canSendOtp: () => boolean; // Check xem có thể gửi OTP không
  getTimeUntilNextOtp: () => number; // Số giây còn lại trước khi có thể gửi lại
  resetOtpData: () => void;
  
  // Reset toàn bộ form
  resetForm: () => void;
}

const initialFormData: SignUpFormData = {
  phone: "",
  phoneVerified: false,
  email: "",
  national_id: "",
  password: "",
  confirmPassword: "",
};

const OTP_COOLDOWN = 60 * 1000; // 1 phút = 60 giây
const MAX_OTP_ATTEMPTS = 5;

export const useSignUpStore = create<SignUpState>((set, get) => ({
  formData: initialFormData,
  otpSentCount: 0,
  lastOtpSentTime: null,
  isOtpBlocked: false,

  // ============================================
  // 📝 FORM DATA SETTERS
  // ============================================
  
  setPhone: (phone: string) => {
    set((state) => ({
      formData: { ...state.formData, phone },
    }));
  },

  setPhoneVerified: (verified: boolean) => {
    set((state) => ({
      formData: { ...state.formData, phoneVerified: verified },
    }));
  },

  setEmail: (email: string) => {
    set((state) => ({
      formData: { ...state.formData, email },
    }));
  },

  setNationalId: (nationalId: string) => {
    set((state) => ({
      formData: { ...state.formData, national_id: nationalId },
    }));
  },

  setPassword: (password: string, confirmPassword: string) => {
    set((state) => ({
      formData: { ...state.formData, password, confirmPassword },
    }));
  },

  // ============================================
  // 📱 OTP MANAGEMENT
  // ============================================
  
  incrementOtpCount: () => {
    set((state) => {
      const newCount = state.otpSentCount + 1;
      const isBlocked = newCount >= MAX_OTP_ATTEMPTS;
      
      if (isBlocked) {
        console.log("❌ [OTP] Đã đạt giới hạn 5 lần gửi OTP");
      }
      
      return {
        otpSentCount: newCount,
        isOtpBlocked: isBlocked,
      };
    });
  },

  updateLastOtpTime: () => {
    set({ lastOtpSentTime: Date.now() });
  },

  canSendOtp: () => {
    const state = get();
    
    // Nếu đã block thì không cho gửi
    if (state.isOtpBlocked) {
      return false;
    }
    
    // Nếu chưa từng gửi thì cho phép
    if (!state.lastOtpSentTime) {
      return true;
    }
    
    // Check cooldown 1 phút
    const timeSinceLastSent = Date.now() - state.lastOtpSentTime;
    return timeSinceLastSent >= OTP_COOLDOWN;
  },

  getTimeUntilNextOtp: () => {
    const state = get();
    
    if (!state.lastOtpSentTime) {
      return 0;
    }
    
    const timeSinceLastSent = Date.now() - state.lastOtpSentTime;
    const timeRemaining = Math.max(0, OTP_COOLDOWN - timeSinceLastSent);
    
    return Math.ceil(timeRemaining / 1000); // Convert to seconds
  },

  resetOtpData: () => {
    set({
      otpSentCount: 0,
      lastOtpSentTime: null,
      isOtpBlocked: false,
    });
  },

  // ============================================
  // 🔄 RESET FORM
  // ============================================
  
  resetForm: () => {
    set({
      formData: initialFormData,
      otpSentCount: 0,
      lastOtpSentTime: null,
      isOtpBlocked: false,
    });
    console.log("✅ [SignUp Store] Form reset successfully");
  },
}));
