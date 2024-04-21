# Ecoflow developer API playground

## Setup

Run `npm i` to install all dependencies.
Copy `.env.example` and rename to `.env` and enter your access- and secret-key as well as the client-id you want to use for the application.

Note: Only 10 clients are allowed to connect, further requests are blocked.

After .env-file is ready, run one of the following scripts:

- `npm run example:mqtt-basic` - This will request all devices bound to your ecoflow account and subscribes to the quota-topic for each device. 
- `npm run example:mqtt-custom-client` - run the poc for custom client
- `npm run example:rest-client` - run some example rest requests using the rest client


## Further reading / inspirations

- https://developer-eu.ecoflow.com/us/document/introduction
- https://github.com/mmiller7/ecoflow-withoutflow
- https://github.com/v1ckxy/ecoflow-withoutflow/issues/1
- https://github.com/vwt12eh8/hassio-ecoflow
- https://github.com/Mark-Hicks/ecoflow-api-examples
- https://konkludenz.de/en/making-ecoflow-wave-2-smart-home-capable-with-node-red-and-mqtt/
- https://github.com/foxthefox/ioBroker.ecoflow-mqtt/blob/main/lib/ecoflow_data.js
