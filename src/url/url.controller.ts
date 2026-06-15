import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto, UserPayload } from './dto/url.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/decorator/user.decorator';
import { Throttle, seconds } from '@nestjs/throttler';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @Throttle({
    default: {
      limit: 20,
      ttl: seconds(60),
    },
  })
  async create(@Body() url: CreateUrlDto, @User() user: UserPayload) {
    return this.urlService.create(url, user.sub);
  }

  @Get(':code')
  async getStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':code')
  @Throttle({
    default: {
      limit: 10,
      ttl: seconds(60),
    },
  })
  async delete(@Param('code') code: string, @User() user: UserPayload) {
    return this.urlService.delete(code, user.sub);
  }
}
