import "dotenv/config";

function getRequiredEnvVar(name: string) {
  const result = process.env[name];

  if (typeof result === "undefined") {
    throw new Error(`Required env var missing: ${name}`);
  }

  return result;
}

export const accessKey = getRequiredEnvVar("accessKey");
export const secretKey = getRequiredEnvVar("secretKey");
export const clientId = getRequiredEnvVar("clientId");
export const restApiHost = "https://api-e.ecoflow.com";
