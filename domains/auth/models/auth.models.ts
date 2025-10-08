export type SignInPayload = {
    email?: string;
    phone?: string;
    password: string;
};


export interface SignUpPayload {
  phone: string;
  email: string;
  password: string;
  national_id: string;
  user_profile: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    address: string;
  };
}


export interface AuthUser {
  id: string;
  email: string;
  phone_number: string;
  status: "pending_verification" | "verified" | "suspended";
  kyc_verified: boolean;
  phone_verified: boolean;
}

export interface AuthSession {
  device_info: string;
  expires_at: string;
  ip_address: string;
  is_active: boolean;
  session_id: string;
}

export interface SignInResponse {
    access_token: string;
    session: AuthSession;
    user: AuthUser;
}

export interface SignInApiResponse extends ApiSuccessResponse<SignInResponse> {
  data: SignInResponse;
}


export interface AuthState {
  // Core data
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}
