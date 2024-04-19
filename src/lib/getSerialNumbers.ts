import { createHmac, randomUUID } from "node:crypto";
import { z } from "zod";

const deviceListResponseSchema = z.object({
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

/**
 * Request serial numbers bound to ecoflow account.
 *
 * @param accessKey
 * @param secretKey
 */
export async function getSerialNumbers(accessKey: string, secretKey: string) {
  const timestamp = Date.now();
  const nonce = randomUUID();
  const hmac = createHmac("sha256", secretKey);
  const sign = hmac
    .update(`accessKey=${accessKey}&nonce=${nonce}&timestamp=${timestamp}`)
    .digest("hex");

  const response = await fetch(
    "https://api-e.ecoflow.com/iot-open/sign/device/list",
    {
      method: "GET",
      headers: [
        ["accessKey", accessKey],
        ["timestamp", timestamp.toString()],
        ["nonce", nonce],
        ["sign", sign],
      ],
    },
  );

  const payload = await response.json();
  const parsedPayload = deviceListResponseSchema.parse(payload);

  return parsedPayload.data.map(({ sn }) => sn);
}
