import mqtt from "mqtt";
import { getTopicUrl, TopicCallback, TopicName } from "./topics";
import { createClient as createRestClient } from "../restClient";

type CreateClientParams = {
  clientId: string;
  accessKey: string;
  secretKey: string;
};

export function createClient(params: CreateClientParams) {
  let client: mqtt.MqttClient;
  let certificateAccount: string;
  let certificatePassword: string;
  const restClient = createRestClient({
    accessKey: params.accessKey,
    secretKey: params.secretKey,
  });

  // Keep track of topic subscriptions to prevent multiple registrations to the same one.
  const subscriptions = new Map<
    string,
    { sn: string; topic: TopicName; cb: TopicCallback[TopicName] }
  >();

  /**
   * Check if we can subscribe to the given topic.
   * - checks if client is defined
   * - checks if client is connected
   * - checks if topic has already been subscribed to
   */
  function shouldSubscribe(topic: string) {
    if (typeof client === "undefined") {
      throw Error("not connected, you must run init() first");
    }

    if (!client.connected) {
      throw new Error("not connected");
    }

    if (subscriptions.has(topic)) {
      console.info("already listening to topic - skipping");
      return false;
    }

    return true;
  }

  return {
    /**
     * Connect to ecoflow mqtt broker
     * Requests credentials via HTTP endpoint.
     * @link https://developer-eu.ecoflow.com/us/document/generalInfo
     */
    init: async () => {
      const credentials = await restClient.requestCertification();

      certificateAccount = credentials.certificateAccount;
      certificatePassword = credentials.certificatePassword;

      client = await mqtt.connectAsync({
        port: credentials.port,
        clientId: params.clientId,
        protocol: credentials.protocol,
        hostname: credentials.url,
        username: certificateAccount,
        password: certificatePassword,
      });

      client.on("message", (receivedTopic, message, packet) => {
        const t = subscriptions.get(receivedTopic);

        switch (t?.topic) {
          case "status":
            (t.cb as TopicCallback["status"])(
              t.topic,
              t.sn,
              message.toString(),
            );
            break;
          case "quotaAll":
            (t.cb as TopicCallback["quotaAll"])(
              t.topic,
              t.sn,
              message.toString(),
            );
            break;
          default:
            throw new Error("Unknown topic");
        }
      });

      client.on("error", (err) => {
        console.error(err);
        client.end();
      });
    },
    /**
     * Subscribe to supported events to the set of given serial numbers.
     *
     * @param topic - topic to subscribe to
     * @param serialNumberCollection - A list of serial numbers
     * @param cb - callback to invoke on message received
     */
    subscribe: async <T extends TopicName>(
      topic: T,
      serialNumberCollection: string[],
      cb: TopicCallback[T],
    ) => {
      for (const serialNumber of serialNumberCollection) {
        const topicUrl = getTopicUrl(topic, certificateAccount, serialNumber);

        if (!shouldSubscribe(topicUrl)) {
          return;
        }

        await client.subscribeAsync(topicUrl);

        subscriptions.set(topicUrl, {
          topic,
          cb,
          sn: serialNumber,
        });
      }
    },
  };
}
