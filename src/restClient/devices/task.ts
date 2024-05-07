import { z } from "zod";

const timeSchema = z.object({
  sec: z.number().int(),
  week: z.number().int(),
  min: z.number().int(),
  hour: z.number().int(),
  month: z.number().int(),
  year: z.number().int(),
  day: z.number().int(),
});

export const taskSchema = z.object({
  taskIndex: z.number().int(),
  type: z.number().int(),
  timeRange: z.object({
    isConfig: z.boolean(),
    isEnabled: z.boolean(),
    timeData: z.number().int(),
    timeMode: z.number().int(),
    startTime: timeSchema,
    stopTime: timeSchema,
  }),
});
