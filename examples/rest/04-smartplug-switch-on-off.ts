/**
 * @file example on how to switch on/off smart-plug.
 */

import { accessKey, secretKey } from "../../src/lib/env";
import { RestClient } from "../../src/restClient";

// Smart-plug serial number
const sn = process.env.smartPlugSn;

async function main() {
  if (typeof sn === "undefined") {
    throw new Error("Serial number undefined");
  }

  const restClient = new RestClient(accessKey, secretKey);

  // Request current state.
  const currentSwitchState = await restClient.getCmd({
    sn,
    params: { quotas: ["2_1.switchSta"] },
  });

  // Depending on the current state determine next state.
  const next = currentSwitchState.data["2_1.switchSta"] ? 0 : 1;

  // Send command.
  const response = await restClient.setCmd({
    sn,
    cmdCode: "WN511_SOCKET_SET_PLUG_SWITCH_MESSAGE",
    params: { plugSwitch: next },
  });

  console.log("response:", response);
}

main().catch((err) => console.error(err));
