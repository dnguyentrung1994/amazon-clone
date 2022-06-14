import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserSignUpDTO } from '../user/user.dto';
import { IUser } from '../user/user.interface';
import { AuthService } from './auth.service';
import { hashPassword } from './utils';
import { mapIUserHidingPassword, mapIUserSignUpToIUser } from './utils/mapper';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @ApiOperation({
    description: 'Save user data into Database',
  })
  @ApiCreatedResponse({ description: 'User data saved successfully' })
  @ApiBadRequestResponse({ description: 'Bad user data' })
  @ApiConflictResponse({ description: 'Duplicated email' })
  @Post('signup')
  async checkDTO(
    @Body() userData: UserSignUpDTO,
  ): Promise<Omit<IUser, 'password'>> {
    try {
      const data = mapIUserSignUpToIUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      return mapIUserHidingPassword(await this.authService.addUser(data));
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
