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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@User() user: any) {
    return user;
  }
}
