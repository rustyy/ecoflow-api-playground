import { z } from "zod";

export const deviceListResponseSchema = z.object({
  code: z.literal("0"),
  message: z.literal("Success"),
  data: z.array(
    z.object({
      sn: z.string(),
      online: z.literal(0).or(z.literal(1)),
      deviceName: z.string().optional(),
    }),
  ),
});
