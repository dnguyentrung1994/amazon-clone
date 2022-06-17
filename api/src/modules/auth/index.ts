import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../user/user.entity';
import { AccessStrategy } from './auth-strategy/access.strategy';
import { LocalStrategy } from './auth-strategy/local.strategy';
import { RefreshStrategy } from './auth-strategy/refresh.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    Logger,
    LocalStrategy,
    AccessStrategy,
    RefreshStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
