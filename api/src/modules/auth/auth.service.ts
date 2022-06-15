import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify';
import { DatabaseError } from 'pg-protocol';
import { QueryFailedError, Repository } from 'typeorm';
import { UserLoginDTO } from '../user/user.dto';
import User from '../user/user.entity';
import { IUser } from '../user/user.interface';
import { IJwtToken, ITokenPayload } from './auth.interface';
import { comparePassword } from './utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    loginData: UserLoginDTO,
  ): Promise<Omit<IUser, 'password' | undefined>> {
    const user = await this.userRepository.findOne({
      where: [
        {
          username: loginData.identification,
        },
        {
          email: loginData.identification,
        },
        {
          phoneNumber: loginData.identification,
        },
      ],
    });
    if (await comparePassword(loginData.password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return undefined;
  }

  async validateViaAccessToken(
    token: ITokenPayload,
  ): Promise<Omit<IUser, 'password' | undefined>> {
    const { id } = token;
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  async addUser(userData: Omit<IUser, 'id' | 'addresses'>): Promise<IUser> {
    try {
      if (!userData.email && !userData.phoneNumber && !userData.username) {
        throw new BadRequestException("user's identification is missing");
      }
      return (
        await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values([userData])
          .returning('*')
          .execute()
      ).generatedMaps[0] as IUser;
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const queryError = error.driverError as DatabaseError;

        if (queryError.code === '23505') {
          throw new ConflictException('email is already in use');
        }
        throw new InternalServerErrorException(queryError);
      }
      throw error;
    }
  }

  generateTokens(id: string): IJwtToken {
    const payload: ITokenPayload = { id };
    const accessToken = this.jwtService.sign(payload, {
      privateKey: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('ACCESS_EXPIRE_IN'),
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      privateKey: this.configService.get<string>('JWT_REFRESH_TOKEN'),
      expiresIn: this.configService.get<string>('REFRESH_EXPIRE_IN'),
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
    });
    return { refreshToken, accessToken };
  }

  generateRefreshCookie(res: FastifyReply, token: string): void {
    res.setCookie('refreshToken', token, {
      httpOnly: true,
      path: 'api/auth',
      maxAge: 24 * 60 * 60 * 7,
    });
  }

  clearRefreshCookie(res: FastifyReply): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      path: 'api/auth',
    });
  }
}
