import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedirectController } from './redirect.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [UrlService],
  controllers: [UrlController, RedirectController],
})
export class UrlModule {}
