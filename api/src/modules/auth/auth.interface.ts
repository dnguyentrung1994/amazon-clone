import { IUser } from '../user/user.interface';
import { FastifyRequest } from 'fastify';
export interface IToken {
  id: string;
  exp: number;
  iat: number;
}
export interface ITokenPayload {
  id: string;
}

export interface ILoginRequest extends FastifyRequest {
  user: IUser;
}

export interface IJwtToken {
  refreshToken: string;
  accessToken: string;
}
