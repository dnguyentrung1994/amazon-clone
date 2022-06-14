import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { UserSignUpDTO } from '../user/user.dto';
import { AuthService } from './auth.service';
import { hashPassword } from './utils';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @ApiHeader({
    name: 'Sign Up',
    description: 'Save user data into Database',
  })
  @ApiCreatedResponse({ description: 'User data saved successfully' })
  @ApiBadRequestResponse({ description: 'Bad user data' })
  @ApiConflictResponse({ description: 'Duplicated email' })
  @Post('test')
  async checkDTO(@Body() userData: UserSignUpDTO) {
    try {
      const data: UserSignUpDTO = {
        ...userData,
        password: await hashPassword(userData.password),
      };

      return (await this.authService.addUser(data)) as UserSignUpDTO;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
