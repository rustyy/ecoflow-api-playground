/**
 * @file example on how to switch on/off ecoflow smart plug
 */
import mqtt from "mqtt";
import { accessKey, clientId, secretKey } from "../../src/lib/env";
import { RestClient } from "../../src/restClient";

// Smart plug serial number
// Put serial number into env-file or enter sn below.
const sn = process.env.smartPlugSn;
// Smart plug switch state
// 0 = off
// 1 = on
const switchState = 0;

async function main() {
  if (typeof sn === "undefined") {
    throw new Error(
      'Serial number not present - please set "smartPlugSn" in .env file',
    );
  }

  // Request credentials.
  const restClient = new RestClient(accessKey, secretKey);
  const { certificateAccount, certificatePassword, url, protocol, port } =
    await restClient.getMqttCredentials();

  // Initialize mqtt-client.
  const mqttClient = mqtt.connect({
    clientId,
    port,
    protocol,
    hostname: url,
    username: certificateAccount,
    password: certificatePassword,
  });

  mqttClient.on("connect", () => {
    // Log all messages received.
    mqttClient.on("message", (topic, message) => {
      console.log({
        topic,
        message: message.toString(),
      });
    });

    // In case of error, shutdown the client.
    mqttClient.on("error", (err) => {
      console.error(err);
      mqttClient.end();
    });

    // Subscribe to reply topic
    mqttClient.subscribe(
      `/open/${certificateAccount}/${sn}/set_reply`,
      (err) => {
        if (err) {
          console.error(err);
        }
      },
    );
  });

  // Looks like message must only contain contain digits
  // and supports a max-lengths of 10
  const messageId = "123456789";

  console.log("messageId:", messageId);

  // Exec set command to switch off smart plug
  mqttClient.publish(
    `/open/${certificateAccount}/${sn}/set`,
    JSON.stringify({
      id: messageId,
      version: "1.0",
      cmdCode: "WN511_SOCKET_SET_PLUG_SWITCH_MESSAGE",
      params: { plugSwitch: switchState },
    }),
  );
}

main().catch((err) => console.error(err));
