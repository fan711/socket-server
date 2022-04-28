# Socket Server

-   Redis
-   Typescript
-   NestJS

## env variables

The following table describes the env vars used by the backend.
These can be set using a `.env` file.

| Variable                        | Description                                                                                                                                                                 | Required |  Default  |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :-------: |
| AWS_REGION                      | The AWS region to work in                                                                                                                                                   |   yes    |           |
| AWS_ACCESS_KEY_ID               | The AWS access key ID to use                                                                                                                                                |   yes    |           |
| AWS_SECRET_ACCESS_KEY           | The AWS secret access key to use                                                                                                                                            |   yes    |           |
| AWS_APP_CONFIG_ID               | The AWS AppConfig ID to use                                                                                                                                                 |    no    |           |
| AWS_APP_CONFIG_PROFILE_ID       | The AWS AppConfig profile ID to use                                                                                                                                         |    no    |           |
| AWS_APP_CONFIG_ENV_ID           | The AWS AppConfig environment ID to use                                                                                                                                     |    no    |           |
| AWS_APP_CONFIG_POLL_INTERVAL    | The interval in seconds that the AWS AppConfig data should be polled at                                                                                                     |    no    |    60     |
| CLOUDWATCH_LOGGROUP_AUDIT_USERS | The AWS CloudWatch LogGroup to write audit logs for instance users to.                                                                                                      |   yes    |           |
| CLOUDWATCH_LOG_RETENTION        | The amount of days until AWS CloudWatch logs are deleted.                                                                                                                   |    no    |     1     |
| REDIS_HOST                      | The Redis host.                                                                                                                                                             |    no    | localhost |
| REDIS_NAT_MAP                   | A list of `Host:Port` combinations for IORedis `natMap`. Should look like `127.0.0.1:3000 10.0.0.1:3000 127.0.0.1:3001 10.0.0.1:3001`.                                      |    no    |           |
| REDIS_PORT                      | The Redis port.                                                                                                                                                             |    no    |   6379    |
| REDIS_MAX_CONNECTION_RETRIES    | The amount of retries if the initial connection to the Redis cluster cannot be established.                                                                                 |    no    |     3     |
| SES_DISABLE_SANDBOX             | Whether SES always sends emails to SES sandbox. **Only disable sandbox in production deployment or for local testing!**                                                     |    no    |   false   |
| SES_SENDER_EMAIL                | The email address to send emails from. For testing purposes, this can be `noreply@dev.diggithy.de` or `noreply@staging.diggithy.de`. Production uses `noreply@diggithy.de`. |   yes    |           |
| TOKEN_VALIDATION_INTERVAL       | The interval in which the user frontend is requested to validate its token on a socket connection (in seconds)                                                              |    no    |    30     |
| SEEDER_DRY_RUN                  | If set to `true`, the seeder does not actually connect to a database and just simulates seeding.                                                                            |    no    |           |
| THROTTLE_TTL                    | The time to live for Throttle. (in seconds)                                                                                                                                 |    no    |     3     |
| THROTTLE_LIMIT                  | The maximum number of requests within the `ttl`.                                                                                                                            |    no    |    15     |

## Basics

### Dependency installation

-   node 14.17.2
-   npm 6.14.13
    Then you can run `npm install` to finally install packages.

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
