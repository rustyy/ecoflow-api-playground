import mqtt from "mqtt";
import { accessKey, clientId, secretKey } from "./lib/env";
import { createClient as createRestClient } from "./restClient";

async function main() {
  const restClient = createRestClient({ accessKey, secretKey });
  const serialNumbers = await restClient.getSerialNumbers();
  const { certificateAccount, certificatePassword, url, protocol, port } =
    await restClient.requestCertification();

  const mqttClient = mqtt.connect({
    clientId,
    port,
    protocol,
    hostname: url,
    username: certificateAccount,
    password: certificatePassword,
  });

  mqttClient.on("connect", () => {
    // For each device - subscribe to quota topic
    for (const sn of serialNumbers) {
      mqttClient.subscribe(`/open/${certificateAccount}/${sn}/quota`, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });

  mqttClient.on("message", (topic, message) => {
    console.log({
      topic,
      message: message.toString(),
    });
  });

  mqttClient.on("error", (err) => {
    console.error(err);
    mqttClient.end();
  });
}

main().catch((err) => console.error(err));
