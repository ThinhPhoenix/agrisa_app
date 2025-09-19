import { z } from "zod";

export const signUpRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    ),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;