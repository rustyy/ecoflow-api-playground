import { z } from "zod";
import { createHmac, randomUUID } from "node:crypto";

const certificationErrorSchema = z.object({
  code: z.string().regex(/^[1-9]\d*$/),
  message: z.string(),
});

const certificationSchema = z.object({
  code: z.literal("0"),
  message: z.literal("Success"),
  data: z.object({
    certificateAccount: z.string(),
    certificatePassword: z.string(),
    url: z.string(),
    port: z.string(),
    protocol: z.literal("mqtts"),
  }),
});

/**
 * Request certification for mqtt communication.
 *
 * @param accessKey
 * @param secretKey
 */
export async function requestCertification(
  accessKey: string,
  secretKey: string,
) {
  const timestamp = Date.now();
  const nonce = randomUUID();
  const hmac = createHmac("sha256", secretKey);
  const sign = hmac
    .update(`accessKey=${accessKey}&nonce=${nonce}&timestamp=${timestamp}`)
    .digest("hex");

  const response = await fetch(
    "https://api-e.ecoflow.com/iot-open/sign/certification",
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
  const parsedError = certificationErrorSchema.safeParse(payload);
  const parsedResult = certificationSchema.safeParse(payload);

  if (parsedError.success) {
    throw new Error(
      `code: ${parsedError.data.code} | message: ${parsedError.data.message}`,
    );
  }

  if (parsedResult.success) {
    const { certificateAccount, certificatePassword, url, protocol, port } =
      parsedResult.data.data;
    return {
      certificateAccount,
      certificatePassword,
      url,
      protocol,
      port: parseInt(port),
    };
  }

  throw new Error("Unknown error");
}
