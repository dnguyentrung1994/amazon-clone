import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ITokenPayload } from '../auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(
  Strategy,
  'accessStrategy',
) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request.headers.authorization
            ? request.headers.authorization.split(' ')[0] === 'Bearer'
              ? request.headers.authorization.split(' ')[1]
              : ''
            : '';
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
    });
  }

  async validate(payload: ITokenPayload) {
    try {
      const user = await this.authService.validateViaAccessToken(payload);
      if (!user) throw new UnauthorizedException('Access token is invalid!');
      return user;
    } catch (error) {
      throw error;
    }
  }
}
