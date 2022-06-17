import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const getTestDataSource = () => {
  if (!process.env.DATABASE_HOST) throw new InternalServerErrorException();
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_TEST,
    dropSchema: true,
    entities: [__dirname + '/../../' + '**/*.entity.ts'],
    synchronize: true,
    logging: false,
  });
};
