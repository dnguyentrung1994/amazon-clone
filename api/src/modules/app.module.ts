
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvPath } from '../common/helpers/env.helper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule } from './auth';
import { APP_GUARD } from '@nestjs/core';
import { AccessAuthGuard } from './auth/auth-guard/access.guard';

const envFilePath: string | undefined = getEnvPath(
  __dirname + `/../common/envs`,
);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .required()
          .allow('development', 'production', 'test'),
        
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_TEST: Joi.string().when('NODE_ENV', {
          is: 'test',
          then: Joi.required(),
        }),


        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_TTL: Joi.number().default(3600),

        API_PORT: Joi.number().default(5000),

        JWT_ACCESS_TOKEN: Joi.string().required(),
        ACCESS_EXPIRE_IN: Joi.string().default('1d'),
        JWT_REFRESH_TOKEN: Joi.string().required(),
        REFRESH_EXPIRE_IN: Joi.string().default('7d'),

        FASTIFY_SECRET: Joi.string().required(),
        ADMIN_VERIFICATION: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),

        database:
          configService.get('NODE_ENV') === 'test'
            ? configService.get<string>('DATABASE_TEST')
            : configService.get<string>('DATABASE_NAME'),
        entities: [join(__dirname, '..', '**/*.entity.ts')],
        dropSchema: configService.get<string>('NODE_ENV') === 'test',
        migrationsTableName: 'migration',
        migrations: ['./src/migration/*.{js,ts}'],
        ssl: configService.get<string>('NODE_ENV') === 'production',
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AccessAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: AccessAuthGuard,
    },
  ],
})
export class AppModule {}
