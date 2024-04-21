import { z } from "zod";

export const statusMessageSchema = z.object({
  id: z.string().regex(/\d+/),
  version: z.string(),
  timestamp: z.number().int().positive(),
  params: z.object({
    status: z.literal(0).or(z.literal(1)),
  }),
});
