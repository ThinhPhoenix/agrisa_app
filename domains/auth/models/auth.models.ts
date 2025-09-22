export type SignInPayload = {
    email?: string;
    phone?: string;
    password: string;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
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
