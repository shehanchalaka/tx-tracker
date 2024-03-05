# Quickstart

Before proceeding make sure you have the following;

1. Node.js (v20.11.1)
2. Api key from Etherscan. Click [here](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics) to get one.
3. MongoDB and Redis installed. You can run with docker [see below](#Run-with-docker)

Create `.env` and configure variables. Refer to `.env.example`

```bash
cp .env.example .env
```

Install dependencies

```bash
npm install
```

To start the server in development mode

```bash
npm run start:dev
```

To run unit tests

```bash
npm run test
```

To run integration tests.
**NOTE: Before running you must have a mongodb instance running**

```bash
npm run test:e2e
```

## Run with docker

If you want to spin up the server in development mode with `npm run start:dev` you can start `mongo` and `redis` containers using command below.

```bash
docker compose up mondo redis -d
```

If you want to spin up the app with docker make sure to configure `docker.env` file first. Refer to `.env.example`. You can spin up the app using the command below.

```bash
docker compose up -d
```
