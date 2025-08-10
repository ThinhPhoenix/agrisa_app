import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(2).max(100),
  age: z.number().min(0).optional()
});

export type User = z.infer<typeof userSchema>;