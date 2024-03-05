# Quickstart

Before proceeding make sure you have the following;

1. [Node.js](https://nodejs.org/en/download) (v20.11.1) installed
2. [Docker](https://docs.docker.com/engine/install/) Installed.
3. Api key from Etherscan. Click [here](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics) to get one.
4. MongoDB and Redis installed. You can run with docker [see below](#run-with-docker)

Create `.env` and configure variables. Refer to `.env.example`

```bash
cp .env.example .env
```
**NOTE: make sure to set ETHERSCAN_API_KEY**
**NOTE: you can set APP_START_BLOCK to override the sync start block**

Install dependencies

```bash
npm install
```

To start the server in development mode

**NOTE: make sure to run mongodb and redis instances first**

```bash
npm run start:dev
```

After runing the server you can access the app on http://localhost:3000

To run unit tests

```bash
npm run test
```

To run integration tests.
**NOTE: Before running you must have a mongodb instance running**

```bash
npm run test:e2e
```

To build the app

```bash
npm run build
```

## Build with docker

To build a docker image you can run the following command

```bash
docker build -t tx-tracker .
```

## Run with docker

If you want to spin up the server in development mode with `npm run start:dev` you can start only `mongo` and `redis` containers using the command below.

```bash
docker compose up mongo redis -d
```

If you want to spin up the app with docker make sure to configure `docker.env` file first. Refer to `.env.example`. You can spin up the app using the command below.

```bash
cp .env.example docker.env

docker compose up -d
```

## API Docs

Swagger UI can be accessed on http://localhost:3000/docs

## Bull dashboard

Bull dashboard can be accessed on http://localhost:3000/sync/queues
