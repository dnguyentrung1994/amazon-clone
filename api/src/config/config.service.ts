import { InternalServerErrorException } from '@nestjs/common';
import 'dotenv/config';

interface RedisConfig {
  host: string;
  port: number;
  ttl: number;
}

interface JWTConfig {
  privateKey: string;
  expireIn: string;
}

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getRequiredValue(key: string): string {
    const value = this.env[key];
    if (!value)
      throw new InternalServerErrorException(
        `ENV value for ${key} is missing!`,
      );
    return value;
  }

  private getOptionalValue(key: string): string | undefined {
    return this.env[key];
  }

  public ensureValues(keys: string[]) {
    keys.forEach((key) => this.getRequiredValue(key));
    return this;
  }

  public getAdminVerification() {
    return this.getRequiredValue('ADMIN_VERIFICATION');
  }

  public getApiPort() {
    return Number(this.getRequiredValue('API_PORT'));
  }

  public isProductionMode(): boolean {
    return this.getOptionalValue('API_MODE') !== 'DEV';
  }

  public getRedisSetting(): RedisConfig {
    return {
      host: this.getRequiredValue('REDIS_HOST'),
      port: Number(this.getRequiredValue('REDIS_PORT')),
      ttl: Number(this.getOptionalValue('REDIS_TTL') ?? '3600'),
    };
  }

  public getAccessJWTSettings(): JWTConfig {
    return {
      privateKey: this.getRequiredValue('JWT_ACCESS_TOKEN'),
      expireIn: this.getOptionalValue('ACCESS_EXPIRE_IN') ?? '1d',
    };
  }

  public getRefreshJWTSettings(): JWTConfig {
    return {
      privateKey: this.getRequiredValue('JWT_REFRESH_TOKEN'),
      expireIn: this.getOptionalValue('REFRESH_EXPIRE_IN') ?? '7d',
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
]);

export { configService };
