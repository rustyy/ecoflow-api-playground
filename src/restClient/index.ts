import { restApiHost } from "../lib/env";
import { deviceListResponseSchema } from "./schemas/deviceListResponseSchema";
import {
  certificationErrorResponseSchema,
  certificationResponseSchema,
} from "./schemas/certificationResponseSchema";
import { SignatureBuilder } from "./signatureBuilder/SignatureBuilder";

type CreateClientParams = {
  accessKey: string;
  secretKey: string;
};

const DEVICE_LIST_URL = `${restApiHost}/iot-open/sign/device/list`;
const DEVICE_QUOTA_URL = `${restApiHost}/iot-open/sign/device/quota/all`;
const CERTIFICATION_URL = `${restApiHost}/iot-open/sign/certification`;

export function createClient(params: CreateClientParams) {
  const signatureBuilder = new SignatureBuilder(
    params.accessKey,
    params.secretKey,
  );

  /**
   * Request device list
   */
  async function getDeviceList() {
    const { timestamp, nonce, accessKey, signature } =
      signatureBuilder.createSignature();

    const response = await fetch(DEVICE_LIST_URL, {
      method: "GET",
      headers: [
        ["accessKey", accessKey],
        ["timestamp", timestamp.toString()],
        ["nonce", nonce],
        ["sign", signature],
      ],
    });

    const payload = await response.json();
    return deviceListResponseSchema.parse(payload);
  }

  function createRequestHeaders(params: {
    accessKey: string;
    timestamp: string;
    nonce: string;
    signature: string;
  }): [string, string][] {
    return [
      ["accessKey", params.accessKey],
      ["timestamp", params.timestamp],
      ["nonce", params.nonce],
      ["sign", params.signature],
    ];
  }

  return {
    getDeviceList,
    getSerialNumbers: async () => {
      return (await getDeviceList()).data.map((device) => device.sn);
    },
    getDeviceQuota: async (serialNumber: string) => {
      const response = await fetch(`${DEVICE_QUOTA_URL}?sn=${serialNumber}`, {
        method: "GET",
        headers: createRequestHeaders(
          signatureBuilder.createSignature({ sn: serialNumber }),
        ),
      });

      return response.json();
    },

    requestCertification: async () => {
      const response = await fetch(CERTIFICATION_URL, {
        method: "GET",
        headers: createRequestHeaders(signatureBuilder.createSignature({})),
      });

      const payload = await response.json();
      const parsedError = certificationErrorResponseSchema.safeParse(payload);
      const parsedResult = certificationResponseSchema.safeParse(payload);

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
    },
  };
}
