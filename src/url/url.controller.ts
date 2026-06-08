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
import { CreateUrlDto } from './dto/url.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/decorator/user.decorator';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() url: CreateUrlDto, @User() user: any) {
    return this.urlService.create(url, user.id);
  }

  @Get(':code')
  async getStats(@Param('code') code: string) {
    return this.urlService.getStats(code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':code')
  async delete(@Param('code') code: string, @User() user: any) {
    return this.urlService.delete(code, user.id);
  }
}
