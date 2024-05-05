import { restApiHost } from "../lib/env";
import { SignatureBuilder } from "./signatureBuilder/SignatureBuilder";
import {
  DeviceListResponse,
  deviceListResponseSchema,
} from "./schemas/deviceListResponseSchema";
import {
  certificationErrorResponseSchema,
  certificationResponseSchema,
} from "./schemas/certificationResponseSchema";
import { sign } from "node:crypto";

export class RestClient {
  #signatureBuilder: SignatureBuilder;

  readonly deviceListUrl = `${restApiHost}/iot-open/sign/device/list`;
  readonly deviceQuotaUrl = `${restApiHost}/iot-open/sign/device/quota/all`;
  readonly setCmdUrl = `${restApiHost}/iot-open/sign/device/quota`;
  readonly certificationUrl = `${restApiHost}/iot-open/sign/certification`;

  constructor(accessKey: string, secretKey: string) {
    this.#signatureBuilder = new SignatureBuilder(accessKey, secretKey);
  }

  #createRequestHeaders(params: {
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
      ["Content-Type", "application/json;charset=UTF-8"],
    ];
  }

  async #makeRequest(
    url: string,
    method: "GET" | "PUT" | "POST",
    // @todo define proper schema for payload
    payload?: Record<string, any>,
  ) {
    const parsedUrl = new URL(url);
    const searchParams = parsedUrl.searchParams;

    const signData = {
      ...searchParams,
      ...payload,
    };

    const response = await fetch(url, {
      method: method,
      headers: this.#createRequestHeaders(
        this.#signatureBuilder.createSignature(payload),
      ),
      ...(method !== "GET" && { body: JSON.stringify(payload) }),
    });

    return response.json();
  }

  /**
   * Receive list of all devices connected to the account.
   * With the optional transform-function the actual response can be customized.
   *
   * @example Map to serial-numbers only
   * await restClient.getDeviceList(({data}) => data.map(({ sn }) => sn))
   */
  async getDeviceList(): Promise<DeviceListResponse>;
  /**
   * Receive list of all devices connected to the account.
   * With the optional transform-function the actual response can be customized.
   *
   * @example Map to serial-numbers only
   * await restClient.getDeviceList(({data}) => data.map(({ sn }) => sn))
   */
  async getDeviceList<T>(
    transform: (data: DeviceListResponse) => T,
  ): Promise<T>;
  async getDeviceList<T>(
    transform?: (data: DeviceListResponse) => T,
  ): Promise<DeviceListResponse | T> {
    const response = await this.#makeRequest(this.deviceListUrl, "GET");
    const parsedResponse = deviceListResponseSchema.parse(response);

    return typeof transform === "function"
      ? transform(parsedResponse)
      : parsedResponse;
  }

  /**
   * Receive device quota.
   * @todo: Response schema based on device type -> as of now: device type can only be determined based on serial number
   *
   * @param serialNumber - the device's serial number to be requested.
   */
  async getDeviceQuota(serialNumber: string) {
    return this.#makeRequest(
      `${this.deviceQuotaUrl}?sn=${serialNumber}`,
      "GET",
    );
  }

  /**
   * Request credentials required to establish a mqtt-connection.
   */
  async getMqttCredentials() {
    const response = await this.#makeRequest(this.certificationUrl, "GET");
    const parsedError = certificationErrorResponseSchema.safeParse(response);
    const parsedResult = certificationResponseSchema.safeParse(response);

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

  /**
   * Execute setCmd to update device setting.
   * @todo typing
   * @param payload
   */
  async setCmd(payload: Record<string, any>): Promise<any> {
    return this.#makeRequest(this.setCmdUrl, "PUT", payload);
  }

  /**
   * Get device setting
   * @todo typing
   * @param payload
   */
  async getCmd(payload: Record<string, any>): Promise<any> {
    return this.#makeRequest(this.setCmdUrl, "POST", payload);
  }
}
