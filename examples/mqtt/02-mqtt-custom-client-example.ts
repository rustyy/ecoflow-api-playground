import { accessKey, clientId, secretKey } from "../../src/lib/env";
import { createClient } from "../../src/mqttClient";
import { RestClient } from "../../src/restClient";

async function main() {
  const restClient = new RestClient(accessKey, secretKey);
  const serialNumbers = await restClient.getDeviceList(({ data }) =>
    data.map(({ sn }) => sn),
  );
  const client = createClient({
    accessKey,
    secretKey,
    clientId,
  });

  await client.init();

  /**
   * get all quota for all registered devices/serial-numbers
   */
  await client.subscribe("quotaAll", serialNumbers, (topic, sn, msg) => {
    console.log({ topic, sn, msg });
  });

  /**
   * "status" topic seem not to work as described in the api documentation :/
   */
  await client.subscribe("status", serialNumbers, (topic, sn, msg) => {
    console.log({ topic, sn, msg });
  });
}

main().catch((err) => console.error(err));
