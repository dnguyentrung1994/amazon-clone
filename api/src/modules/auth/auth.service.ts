import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg-protocol';
import { QueryFailedError, Repository } from 'typeorm';
import { UserLoginDTO } from '../user/user.dto';
import User from '../user/user.entity';
import { IUser } from '../user/user.interface';
import { comparePassword } from './utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(loginData: UserLoginDTO) {
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
    if (await comparePassword(loginData.password, user.password)) return user;
    return undefined;
  }

  async addUser(userData: Omit<IUser, 'id' | 'addresses'>) {
    try {
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
}
