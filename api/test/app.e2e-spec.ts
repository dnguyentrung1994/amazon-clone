import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/modules/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/exception-filter';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,POST,PATCH,DELETE',
      credentials: true,
    });
    await app.register(fastifyCookie, {
      secret: app.get(ConfigService).get<string>('FASTIFY_SECRET'),
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ (GET)', async () => {
    return app
      .inject({
        method: 'GET',
        url: '/',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.payload).toEqual('test');
      });
  });

  describe('Auth', () => {
    describe('/auth/signup (POST): sign up', () => {
      it('Without identification: should return status 400', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/signup',
            payload: {
              password: 's@mpl3P@ssw0rd',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-01-01',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(400);
            expect(result.headers['set-cookie']).not.toBeDefined();
            expect(body['message']).toStrictEqual([
              'email must be an email',
              "email is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
              "username is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
              'phoneNumber must be a valid phone number',
              "phone number is not set. At least one of 'email', 'username' or 'phoneNumber' needs to be defined",
            ]);
          });
      });
      it('First time: should return status 201', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/signup',
            payload: {
              email: 'dummy@mail.com',
              password: 's@mpl3P@ssw0rd',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-01-01',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(201);
            expect(result.headers['set-cookie']).toBeDefined();
            expect(body['password']).not.toBeDefined();
            expect(body['accessToken']).toBeDefined();
          });
      });
      it('Second time: should return status 400', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/signup',
            payload: {
              email: 'dummy@mail.com',
              password: 's@mpl3P@ssw0rd',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-01-01',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(400);
            expect(result.headers['set-cookie']).not.toBeDefined();
            expect(body['message']).toStrictEqual(['email is already in use']);
          });
      });
    });

    describe('/auth/login (POST): log in', () => {
      it('Wrong identification: should return status 401', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
              identification: 'dummy2@mail.com',
              password: 's@mpl3P@ssw0rd',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(401);
            expect(result.headers['set-cookie']).not.toBeDefined();
            expect(body['message']).toBe('Failed to validate user');
          });
      });
      it('Wrong password: should return status 401', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
              identification: 'dummy@mail.com',
              password: 's@mpl3P@ssw0rD',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(401);
            expect(result.headers['set-cookie']).not.toBeDefined();
            expect(body['message']).toBe('Failed to validate user');
          });
      });
      it('Correct identification: should return status 202', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
              identification: 'dummy@mail.com',
              password: 's@mpl3P@ssw0rd',
            },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(202);
            expect(result.headers['set-cookie']).toBeDefined();
            expect(body['password']).not.toBeDefined();
            expect(body['accessToken']).toBeDefined();
          });
      });
    });

    describe('/auth/logout (POST): log out', () => {
      it('Without Authorization header: should return status 401', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/logout',
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(401);
            expect(body['message']).toBe('Unauthorized');
          });
      });

      it('With correct Authorization header: should return status 202', async () => {
        const accessToken = JSON.parse(
          (
            await app.inject({
              method: 'POST',
              url: '/auth/login',
              payload: {
                identification: 'dummy@mail.com',
                password: 's@mpl3P@ssw0rd',
              },
            })
          ).body,
        )['accessToken'];
        return app
          .inject({
            method: 'POST',
            url: '/auth/logout',
            headers: { authorization: `Bearer ${accessToken}` },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(202);
            expect(result.headers['set-cookie']).toBeDefined();
            expect(body['message']).toBe('Logged out');
          });
      });
    });

    describe('/auth/refresh (POST): refresh', () => {
      it('wrong Cookie: should return status 401', async () => {
        return app
          .inject({
            method: 'POST',
            url: '/auth/refresh',
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toEqual(401);
            expect(body['message']).toBe('Unauthorized');
            expect(result.headers['set-cookie']).toBeUndefined();
          });
      });
      it('With correct cookie: Should return status 200', async () => {
        const refreshToken = JSON.parse(
          (
            await app.inject({
              method: 'POST',
              url: '/auth/login',
              payload: {
                identification: 'dummy@mail.com',
                password: 's@mpl3P@ssw0rd',
              },
            })
          ).body,
        )['refreshToken'];
        return app
          .inject({
            method: 'POST',
            url: '/auth/refresh',
            cookies: { refreshToken },
          })
          .then((result) => {
            const body = JSON.parse(result.body);
            expect(result.statusCode).toBe(200);
            expect(body['password']).toBeUndefined();
            expect(result.headers['set-cookie']).toBeDefined();
            expect(body['accessToken']).toBeDefined();
          });
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
