import { createHmac, randomUUID } from "node:crypto";
import { flattenObject } from "./flattenObject";

export class SignatureBuilder {
  readonly #accessKey: string;
  readonly #secretKey: string;

  constructor(accessKey: string, secretKey: string) {
    this.#accessKey = accessKey;
    this.#secretKey = secretKey;
  }

  #appendAccessKey(msg: string, nonce: string, timestamp: string) {
    const suffix = `accessKey=${this.#accessKey}&nonce=${nonce}&timestamp=${timestamp}`;
    return msg ? `${msg}&${suffix}` : suffix;
  }

  buildDataString(data: Record<string, any>) {
    const flattened = flattenObject(data);
    const tmp = [];
    // As mentioned in the ecoflow docs -> keys must be sorted.
    // @link https://developer-eu.ecoflow.com/us/document/generalInfo
    // @todo ascii sort
    const keys = Object.keys(flattened).sort();

    for (const key of keys) {
      tmp.push(`${key}=${flattened[key]}`);
    }

    return tmp.join("&");
  }

  createSignature(msg?: Record<string, any>) {
    const hmac = createHmac("sha256", this.#secretKey);
    const timestamp = Date.now().toString();
    const nonce = randomUUID();
    const data = this.#appendAccessKey(
      this.buildDataString(msg ?? {}),
      nonce,
      timestamp,
    );

    const signature = hmac.update(data).digest("hex");

    return {
      nonce,
      timestamp,
      signature,
      accessKey: this.#accessKey,
    };
  }
}
