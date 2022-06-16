## Description

Amazon clone api

Proudly built with [NestJS](https://github.com/nestjs/nest)

## Before starting

- Although this comes with a default env file, it is strongly recommended that you make another env in the same folder based on the default `.env`. The app currently accept `development.env` and `production.env` for development and production environment respectively. You can find the env at `/src/common/envs`
- Before starting, make sure that you have [NodeJS](https://nodejs.org/en), [PostgresQL](https://www.postgresql.org) and [Redis](https://redis.io) installed in your computer.
- This project employs 2 databases, with one being used for testing purposes. Since TypeORM does not automatically create databases, you should manually create them yourself.

## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
