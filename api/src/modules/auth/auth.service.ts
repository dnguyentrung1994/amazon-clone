import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg-protocol';
import { QueryFailedError, Repository } from 'typeorm';
import { UserSignUpDTO } from '../user/user.dto';
import User from '../user/user.entity';
import { IUser } from '../user/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addUser(userData: UserSignUpDTO) {
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
          throw new ConflictException('username already exist');
        }
        throw new InternalServerErrorException(queryError);
      }
      throw error;
    }
  }
}
