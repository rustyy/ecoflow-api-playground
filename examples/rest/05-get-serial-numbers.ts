/**
 * @file example on how to request all serial numbers using rest-client.
 */

import { accessKey, secretKey } from "../../src/lib/env";
import { RestClient } from "../../src/restClient";

async function main() {
  const restClient = new RestClient(accessKey, secretKey);
  const response = await restClient.getDeviceList(({ data }) =>
    data.map(({ sn }) => sn),
  );
  console.log("response:", response);
}

main().catch((err) => console.error(err));
