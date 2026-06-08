import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UrlModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService],
})
export class AppModule {}
