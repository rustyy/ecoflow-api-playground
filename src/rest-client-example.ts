import mqtt from "mqtt";
import { accessKey, clientId, secretKey } from "./lib/env";
import { createClient as createRestClient } from "./restClient";

async function main() {
  const restClient = createRestClient({ accessKey, secretKey });

  const deviceList = await restClient.getDeviceList();
  console.log(deviceList);

  const serialNumbers = await restClient.getSerialNumbers();
  console.log(serialNumbers);

  for (const serialNumber of serialNumbers) {
    console.log(await restClient.getDeviceQuota(serialNumber));
  }
}

main().catch((err) => console.error(err));
