# Ecoflow developer API playground

## Setup

Run `npm i` to install all dependencies.
Copy `.env.example` and rename to `.env` and enter your access- and secret-key as well as the client-id you want to use for the application.

Note: Only 10 clients are allowed to connect, further requests are blocked.

After .env-file is ready, run `npm run mqtt`.
This will request all devices bound to your ecoflow account and subscribes to the quota-topic for each device.