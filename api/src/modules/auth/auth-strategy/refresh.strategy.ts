import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from '../../user/user.interface';
import { ITokenPayload } from '../auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshStrategy',
) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log(request.cookies);
          return request.cookies['refreshToken'];
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN'),
    });
  }

  async validate(payload: ITokenPayload): Promise<Omit<IUser, 'password'>> {
    try {
      const user = await this.authService.validateViaAccessToken(payload);
      if (!user) throw new UnauthorizedException('Refresh token is invalid!');
      return user;
    } catch (error) {
      throw error;
    }
  }
}
