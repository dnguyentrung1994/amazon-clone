import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import User from 'src/modules/user/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'identification' });
  }

  async validate(
    identification: string,
    password: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.authService.validateUser({
      identification,
      password,
    });
    if (!user) {
      throw new UnauthorizedException('Failed to validate user');
    }
    return user;
  }
}
