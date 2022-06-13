<h2>Amazon-clone</h2>

<p>This is an attempt to (poorly) reproduce Amazon</p>
<p>FOR FUN AND GIGGLES ONLY</p>

**API**

NESTJS: [Nestjs's Documentation](https://docs.nestjs.com/)

**CLIENT**

NEXTJS: [NextJs's Documentation](https://nextjs.org/)

**SET UP Guide**

- Pre-requisite:

  - NodeJS installed. ([Download link](https://nodejs.org/en/download/))
  - PostgresQl installed. ([Download link](https://www.postgresql.org/download/)). You must also create database before running.
  - Redis installed. ([Installation guide](https://redis.io/docs/getting-started/))

- Program set-up:

  - API:

    **NOTE**: It is heavily recommended that you set up your own environment variables, rather than falling back to `.env`, especially for production environment. As such, please first check for the `.env` file located in `api/src/common/envs`, then re-create an appropriate `.env` file accordingly, in the same directory.

    In development mode, system would check for `development.env`, while in production mode, system would check for `production.env`. During development, if `development.env` is not found, the generic fallback `.env` is loaded instead. DO NOT ADD FILES OTHER THAN `.env` TO SOURCE CONTROL.

    After setting up the environment variables, run the following in order:

    ```
    cd api
    yarn
    yarn start:dev
    ```

  - client:
    ```
    cd client
    yarn
    yarn dev
    ```
