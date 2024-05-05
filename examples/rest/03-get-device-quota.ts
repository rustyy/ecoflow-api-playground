/**
 * @file example on how to request device quota through rest-client.
 */
import { accessKey, secretKey } from "../../src/lib/env";
import { RestClient } from "../../src/restClient";

// set serial-number via env-file or update line below.
const sn = process.env.smartPlugSn;

async function main() {
  if (typeof sn === "undefined") {
    throw new Error("Serial number undefined");
  }

  const restClient = new RestClient(accessKey, secretKey);
  const response = await restClient.getDeviceQuota(sn);

  console.log("response:", response);
}

main().catch((err) => console.error(err));
