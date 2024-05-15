import { z } from "zod";
import { taskSchema } from "./task";

/*********************************************
 * Serial number
 *********************************************/

const smartPlugSerialNumberSchema = z.custom<`HW52${string}`>((val) => {
  return typeof val === "string" ? /^HW52/.test(val) : false;
});

// Serial number typeguard.
export const isSmartPlugSn = (x: unknown): x is SmartPlugSn => {
  return smartPlugSerialNumberSchema.safeParse(x).success;
};

export type SmartPlugSn = z.infer<typeof smartPlugSerialNumberSchema>;

/*********************************************
 * Set commands
 *
 * At the moment there are 3 commands available for smart-plug
 * - turning sp on/off
 * - set led brightness
 * - removing a configured task
 *********************************************/

const setCommandSchema = z.union([
  z.object({
    sn: smartPlugSerialNumberSchema,
    cmdCode: z.literal("WN511_SOCKET_SET_PLUG_SWITCH_MESSAGE"),
    params: z
      .object({
        plugSwitch: z.literal(0).or(z.literal(1)),
      })
      .strict(),
  }),
  z.object({
    sn: smartPlugSerialNumberSchema,
    cmdCode: z.literal("WN511_SOCKET_SET_BRIGHTNESS_PACK"),
    params: z
      .object({
        brightness: z.number().int().min(0).max(1023),
      })
      .strict(),
  }),
  z.object({
    sn: smartPlugSerialNumberSchema,
    cmdCode: z.literal("WN511_SOCKET_DELETE_TIME_TASK"),
    params: z
      .object({
        taskIndex: z.number().int().min(0).max(9),
      })
      .strict(),
  }),
]);

export type SmartPlugSetCommand = z.infer<typeof setCommandSchema>;

/**
 * Define response schema for the commands.
 */

const setCommandSuccessResponseSchema = z.object({
  code: z.literal("0"),
  message: z.literal("Success"),
  eagleEyeTraceId: z.string(),
  tid: z.string(),
});

const setCommandFailureResponseSchema = z.object({
  code: z.string().regex(/\d+/),
  message: z.string(),
  eagleEyeTraceId: z.string(),
  tid: z.string(),
});

const setCommandResponseSchema = z.union([
  setCommandSuccessResponseSchema,
  setCommandFailureResponseSchema,
]);

export type SetCommandResponse = z.infer<typeof setCommandResponseSchema>;

/*********************************************
 * Get commands
 *********************************************/

const taskNameSchema = z.custom<`2_2.task${number}`>((val) => {
  return typeof val === "string" ? /^2_2\.task[0-9]$/.test(val) : false;
});

const getCommandSchema = z.object({
  sn: smartPlugSerialNumberSchema,
  params: z
    .object({
      quotas: z.array(
        z.union([
          z.literal("2_1.switchSta"),
          z.literal("2_1.brightness"),
          taskNameSchema,
        ]),
      ),
    })
    .strict(),
});

export type SmartPlugGetCommand = z.infer<typeof getCommandSchema>;

// @todo: docs are confusing concerning task indexes
export const getCommandResponseSchema = z.object({
  code: z.string().regex(/\d+/),
  message: z.string(),
  eagleEyeTraceId: z.string(),
  tid: z.string(),
  data: z
    .object({
      "2_1.brightness": z.number().min(0).max(1023).optional(),
      "2_1.switchSta": z.boolean().optional(),
      "2_2.task0": taskSchema.optional(),
      "2_2.task1": taskSchema.optional(),
      "2_2.task2": taskSchema.optional(),
      "2_2.task3": taskSchema.optional(),
      "2_2.task4": taskSchema.optional(),
      "2_2.task5": taskSchema.optional(),
      "2_2.task6": taskSchema.optional(),
      "2_2.task7": taskSchema.optional(),
      "2_2.task8": taskSchema.optional(),
      "2_2.task9": taskSchema.optional(),
    })
    .optional(),
});

export type SmartPlugGetCommandSuccessResponse = z.infer<
  typeof getCommandResponseSchema
>;
