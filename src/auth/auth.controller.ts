import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorator/user.decorator';
import { seconds, Throttle } from '@nestjs/throttler';
import { UserPayload } from '../url/dto/url.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({
    default: {
      limit: 3,
      ttl: seconds(60),
    },
  })
  async signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  @Throttle({
    default: {
      limit: 5,
      ttl: seconds(60),
    },
  })
  async signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@User() user: UserPayload) {
    return user;
  }
}
