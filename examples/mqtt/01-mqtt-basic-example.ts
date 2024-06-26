/**
 * @file mqtt example that registers to quota topic
 *       for all serial numbers connected to the specific account
 */
import mqtt from "mqtt";
import { accessKey, clientId, secretKey } from "../../src/lib/env";
import { RestClient } from "../../src/restClient";

async function main() {
  const restClient = new RestClient(accessKey, secretKey);
  const serialNumbers = await restClient.getDeviceList(({ data }) =>
    data.map(({ sn }) => sn),
  );
  const { certificateAccount, certificatePassword, url, protocol, port } =
    await restClient.getMqttCredentials();

  // Initialize mqtt client.
  const mqttClient = await mqtt.connectAsync({
    clientId,
    port,
    protocol,
    hostname: url,
    username: certificateAccount,
    password: certificatePassword,
  });

  // Subscribe to quota-topic for all received serial numbers.
  for (const sn of serialNumbers) {
    await mqttClient.subscribeAsync(`/open/${certificateAccount}/${sn}/quota`);
  }

  // Listen to "message"-event to retrieve quota-messages.
  mqttClient.on("message", (topic, message) => {
    console.log({
      topic,
      message: message.toString(),
    });
  });

  // In case of an error, shutdown the client.
  mqttClient.on("error", (err) => {
    console.error(err);
    mqttClient.end();
  });
}

main().catch((err) => console.error(err));
