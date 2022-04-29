# Socket Server

-   Redis
-   Typescript
-   NestJS

## env variables

The following table describes the env vars used by the backend.
These can be set using a `.env` file.

| Variable                        | Description                                                                                                                                                                 | Required |  Default  |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-------: |
| REDIS_HOST                      | The Redis host.                                                                                                                                                             |    no    | localhost |
| REDIS_NAT_MAP                   | A list of `Host:Port` combinations for IORedis `natMap`. Should look like `127.0.0.1:3000 10.0.0.1:3000 127.0.0.1:3001 10.0.0.1:3001`.                                      |    no    |           |
| REDIS_PORT                      | The Redis port.                                                                                                                                                             |    no    |   6379    |
| REDIS_MAX_CONNECTION_RETRIES    | The amount of retries if the initial connection to the Redis cluster cannot be established.                                                                                 |    no    |     3     |

## Basics

### Dependency installation

-   node 14.17.2
-   npm 6.14.13
-   Then you can run `npm install` to finally install packages.

**Building:** `npm run build`

## Running the app

**development:** `npm run start`

**watch mode:** `npm run start:dev`

**production mode:** `npm run start:prod`

### Running the whole service locally

To run a completely local service using docker compose, run:

1. `npm run build`
2. `docker-compose up`

This will set up local Redis and backend, which exposes port 3000.

## Test

**unit tests:** `npm run test`

**e2e tests:** `npm run test:e2e`

**test coverage:** `npm run test:cov`
