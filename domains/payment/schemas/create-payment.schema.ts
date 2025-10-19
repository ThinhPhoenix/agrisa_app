import { z } from "zod";

const createPaymentSchema = z.object({
  amount: z.number(),
  description: z.string(),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
  type: z.string(),
  items: z.array(
    z.object({
      item_id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
});

export { createPaymentSchema };
export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;