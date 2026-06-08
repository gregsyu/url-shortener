import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const pool = new Pool({
      connectionString: configService.getOrThrow('DATABASE_URL'),
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
