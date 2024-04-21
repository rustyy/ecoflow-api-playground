import mqtt from "mqtt";
import { requestCertification } from "./lib/requestCertification";
import { accessKey, clientId, secretKey } from "./lib/env";
import { getSerialNumbers } from "./lib/getSerialNumbers";

async function main() {
  const { certificateAccount, certificatePassword, url, protocol, port } =
    await requestCertification(accessKey, secretKey);
  const serialNumbers = await getSerialNumbers(accessKey, secretKey);

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
