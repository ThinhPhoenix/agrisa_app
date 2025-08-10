import { z } from "zod";

export const signInRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;