import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { Public } from '../../common/decorators/AuthIsPublic';
import { UserSignUpDTO } from '../user/user.dto';
import { IUser } from '../user/user.interface';
import { LocalAuthGuard } from './auth-guard/local.guard';
import { RefreshAuthGuard } from './auth-guard/refresh.guard';
import { ILoginRequest } from './auth.interface';
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

  @Public()
  @ApiOperation({
    description: 'Save user data into Database',
  })
  @ApiCreatedResponse({ description: 'User data saved successfully' })
  @ApiBadRequestResponse({ description: 'Bad user data' })
  @ApiConflictResponse({ description: 'Duplicated email' })
  @Post('signup')
  async signUp(
    @Body() userData: UserSignUpDTO,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<Omit<IUser, 'password'>> {
    try {
      const data = mapIUserSignUpToIUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      const newUser = mapIUserHidingPassword(
        await this.authService.addUser(data),
      );

      const tokens = this.authService.generateTokens(newUser.id);

      this.authService.generateRefreshCookie(res, tokens.refreshToken);
      return res.status(HttpStatus.CREATED).send({
        ...tokens,
        ...newUser,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  @Public()
  @ApiOperation({
    description: "return logged user's data",
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['identification', 'password'],
      properties: {
        identification: {
          type: 'string',
          examples: ['JohnDoe01', '+4123456789', 'JohnDoe@dummy.oc'],
          example: 'JohnDoe01',
        },
        password: {
          type: 'string',
          example: 's@mpl3p@ssw0rd',
        },
      },
    },
  })
  @ApiAcceptedResponse({ description: 'Logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Login data incorrect' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: ILoginRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user } = req;
    const tokens = this.authService.generateTokens(user.id);
    this.authService.generateRefreshCookie(res, tokens.refreshToken);
    return res.status(HttpStatus.ACCEPTED).send({
      ...tokens,
      ...user,
    });
  }

  @ApiOperation({
    description: 'delete refresh token on cookie',
  })
  @ApiBearerAuth('Authorization')
  @ApiAcceptedResponse({ description: 'Logged out successfully' })
  @ApiUnauthorizedResponse({ description: 'Access token is corrupted' })
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    this.authService.clearRefreshCookie(res);
    return res.status(HttpStatus.ACCEPTED).send({
      message: 'Logged out',
    });
  }

  @Public()
  @ApiOperation({
    description: 'return new tokens and hydrate user data',
  })
  @Post('refresh')
  @ApiCookieAuth()
  @UseGuards(RefreshAuthGuard)
  async refresh(
    @Req() req: ILoginRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user } = req;
    const tokens = this.authService.generateTokens(user.id);
    this.authService.generateRefreshCookie(res, tokens.refreshToken);
    return {
      ...tokens,
      ...user,
    };
  }
}
