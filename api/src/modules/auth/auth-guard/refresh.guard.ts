import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshJWTGuard extends AuthGuard('refreshToken') {
  constructor() {
    super();
  }
}
