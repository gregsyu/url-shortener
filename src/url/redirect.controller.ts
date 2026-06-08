import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { UrlService } from './url.service';

@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Redirect()
  @Get(':code')
  async redirect(@Param('code') code: string) {
    const url = await this.urlService.findByCode(code);
    await this.urlService.incrementClicks(code);

    return {
      url: url.original,
    };
  }
}
