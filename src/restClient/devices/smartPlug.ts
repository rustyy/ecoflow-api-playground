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

/*********************************************
 * Quota
 *********************************************/

const integer = z.number().int();

const quotaAll = z.object({
  // RGB light brightness: 0–1023 (the larger the value, the higher the brightness)
  "2_1.brightness": integer,
  // Country
  "2_1.country": integer.nonnegative(),
  // Operating current (mA)
  "2_1.current": integer.nonnegative(),
  // Error code
  "2_1.errCode": integer,
  // Operating frequency (Hz)
  "2_1.freq": integer,
  // Maximum output current: 0.1 A
  "2_1.maxCur": integer,

  // @todo: Not documented in the official docs.
  "2_1.consNum": integer,
  // @todo: Not documented in the official docs. can be negative
  "2_1.consWatt": integer,
  // @todo: Not documented in the official docs.
  "2_1.geneNum": integer,
  // @todo: Not documented in the official docs.
  "2_1.geneWatt": integer,
  // @todo: Not documented in the official docs.
  "2_1.heartbeatFrequency": integer.nonnegative(),
  // @todo: Not documented in the official docs.
  "2_1.lanState": integer,
  // @todo: Not documented in the official docs.
  "2_1.matterFabric": integer,
  // Smart plug switch status
  "2_1.switchSta": z.boolean(),
  // Smart plug temperature
  "2_1.temp": integer,
  // City
  "2_1.town": intager.nonnegative(),
  // Update time
  "2_1.updateTime": z.string(),
  // Operating voltage (V)
  "2_1.volt": integer.nonnegative(),
  // Smart plug warning code
  "2_1.warnCode": integer,
  // Operating output power: 0.1 W
  "2_1.watts": integer.nonnegative(),
  "2_2.task1": taskSchema,
  "2_2.task10": taskSchema,
  "2_2.task11": taskSchema,
  "2_2.task2": taskSchema,
  "2_2.task3": taskSchema,
  "2_2.task4": taskSchema,
  "2_2.task5": taskSchema,
  "2_2.task6": taskSchema,
  "2_2.task7": taskSchema,
  "2_2.task8": taskSchema,
  "2_2.task9": taskSchema,

  // @todo: Not documented in the official docs.
  "2_1.maxWatts": integer,
  // @todo: Not documented in the official docs.
  "2_1.meshEnable": integer,
  // @todo: Not documented in the official docs.
  "2_1.meshId": integer,
  // @todo: Not documented in the official docs.
  "2_1.meshLayel": integer,
  // @todo: Not documented in the official docs.
  "2_1.mqttErr": integer,
  // @todo: Not documented in the official docs.
  "2_1.mqttErrTime": integer,
  // @todo: Not documented in the official docs.
  "2_1.otaDlErr": integer,
  // @todo: Not documented in the official docs.
  "2_1.otaDlTlsErr": integer,
  // @todo: Not documented in the official docs.
  "2_1.parentMac": integer,
  // @todo: Not documented in the official docs.
  "2_1.parentWifiRssi": integer,
  // @todo: Not documented in the official docs.
  "2_1.resetCount": integer,
  // @todo: Not documented in the official docs.
  "2_1.resetReason": integer,
  // @todo: Not documented in the official docs.
  "2_1.rtcResetReason": integer,
  // @todo: Not documented in the official docs.
  "2_1.runTime": integer,
  // @todo: Not documented in the official docs.
  "2_1.selfEmsSwitch": integer,
  // @todo: Not documented in the official docs.
  "2_1.selfMac": integer,
  // @todo: Not documented in the official docs. can be negative
  "2_1.staIpAddr": integer,
  // @todo: Not documented in the official docs.
  "2_1.stackFree": integer,
  // @todo: Not documented in the official docs.
  "2_1.stackMinFree": integer,
  // @todo: Not documented in the official docs.
  "2_1.wifiErr": integer,
  // @todo: Not documented in the official docs.
  "2_1.wifiErrTime": integer,
  // @todo: Not documented in the official docs.
  "2_2.updateTime": z.string(),
});

export type SmartPlugQuotaAll = z.infer<typeof quotaAll>;
