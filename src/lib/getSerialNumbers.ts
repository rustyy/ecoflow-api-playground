import axios from "axios";
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

  const response = await axios({
    method: "GET",
    url: "https://api-e.ecoflow.com/iot-open/sign/device/list",
    headers: {
      accessKey,
      timestamp,
      nonce,
      sign,
    },
  });

  const parsed = deviceListResponseSchema.parse(response.data);

  return parsed.data.map(({ sn }) => sn);
}
