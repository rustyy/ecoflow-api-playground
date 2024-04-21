export type TopicName = keyof typeof topics;

export type TopicCallback = {
  status: (topic: "status", sn: string, msg: string) => void;
  quotaAll: (topic: "quotaAll", sn: string, msg: string) => void;
};

const topics = {
  quotaAll: "/open/$[certificateAccount]/$[sn]/quota",
  status: "/open/$[certificateAccount]/$[sn]/status",
} as const;

export function getTopicUrl(topic: TopicName, account: string, sn: string) {
  return topics[topic]
    .replace("$[certificateAccount]", account)
    .replace("$[sn]", sn);
}
