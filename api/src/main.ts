import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { filterOnly } from './common/winston/level-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception-filter';
import { RequestLogger } from './common/winston/request-logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      //define winston as a logger in place of nest's native logger
      logger: WinstonModule.createLogger({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.prettyPrint(),
        ),
        transports: [
          // console logger
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('logger', {
                prettyPrint: true,
              }),
            ),
          }),
          // error logger
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: filterOnly('error'),
            eol: '\n',
          }),
          // requests logger
          new winston.transports.File({
            filename: 'logs/request.log',
            level: 'verbose',
            format: filterOnly('verbose'),
            eol: '\n',
          }),
        ],
      }),
    },
  );

  //setting up swagger
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('store api')
      .setVersion('1.1')
      .setDescription('placeholder')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  //CORS settings
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,POST,PATCH,DELETE',
    credentials: true,
  });

  //registering fastify helmet middleware
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  await app.register(fastifyCookie, {
    secret: app.get(ConfigService).get<string>('FASTIFY_SECRET'),
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestLogger());
  //registering fastify cookies middleware

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
