# Ecoflow developer API playground

## Setup

Run `npm i` to install all dependencies.
Copy `.env.example` and rename to `.env` and enter your access- and secret-key as well as the client-id you want to use for the application.

Note: Only 10 clients are allowed to connect, further requests are blocked.

After .env-file is ready, you can run the scripts located in the example dir:

e.g. `npx ts-node examples/rest/03-get-device-quota.ts`

## Further reading / inspirations

- https://developer-eu.ecoflow.com/us/document/introduction
- https://github.com/mmiller7/ecoflow-withoutflow
- https://github.com/v1ckxy/ecoflow-withoutflow/issues/1
- https://github.com/vwt12eh8/hassio-ecoflow
- https://github.com/Mark-Hicks/ecoflow-api-examples
- https://konkludenz.de/en/making-ecoflow-wave-2-smart-home-capable-with-node-red-and-mqtt/
- https://github.com/foxthefox/ioBroker.ecoflow-mqtt/blob/main/lib/ecoflow_data.js
