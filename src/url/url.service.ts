import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUrlDto, userId: string) {
    let code = data.customCode;
    let originalUrl = data.url;

    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = `https://${originalUrl}`;
    }

    if (code) {
      const existing = await this.prisma.url.findUnique({
        where: { code },
      });

      if (existing) {
        throw new ConflictException('Code already exists');
      }
    } else {
      code = nanoid(7);
    }

    const url = await this.prisma.url.create({
      data: {
        original: originalUrl,
        code,
        userId,
      },
    });

    return {
      ...url,
      shortUrl: `http://localhost:3000/${url.code}`,
    };
  }

  async findByCode(code: string) {
    const url = await this.prisma.url.findUnique({
      where: { code },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return url;
  }

  async incrementClicks(code: string) {
    return this.prisma.url.update({
      where: { code },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  async getStats(code: string) {
    const url = await this.findByCode(code);

    return {
      code: url.code,
      originalUrl: url.original,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };
  }

  async findAllByUser(userId: string, limit = 10) {
    return this.prisma.url.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(code: string, userId: string) {
    const url = await this.findByCode(code);

    if (url.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.url.delete({
      where: { code },
    });
  }
}
