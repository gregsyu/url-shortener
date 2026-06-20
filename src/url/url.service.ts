import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto, UrlStats } from './dto/url.dto';
import { nanoid } from 'nanoid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { days, seconds } from '@nestjs/throttler';

@Injectable()
export class UrlService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private statsCacheKey(code: string) {
    return `url:stats:${code}`;
  }

  private allUsersCacheKey(userId: string) {
    return `url:users:${userId}`;
  }

  private redirectCacheKey(code: string) {
    return `url:redirect:${code}`;
  }

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

    await this.cacheManager.del(this.allUsersCacheKey(userId));

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
    const url = await this.prisma.url.update({
      where: { code },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    await this.cacheManager.del(this.statsCacheKey(code));

    return url;
  }

  async getStats(code: string) {
    const cacheKey = this.statsCacheKey(code);
    const cached = await this.cacheManager.get<UrlStats>(cacheKey);

    if (cached) {
      return cached;
    }

    const url = await this.findByCode(code);

    const stats: UrlStats = {
      code: url.code,
      originalUrl: url.original,
      clicks: url.clicks,
      createdAt: url.createdAt,
    };

    await this.cacheManager.set(cacheKey, stats, seconds(30));

    return stats;
  }

  async findAllByUser(userId: string) {
    const cacheKey = this.allUsersCacheKey(userId);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const urls = await this.prisma.url.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await this.cacheManager.set(cacheKey, urls, seconds(60));

    return urls;
  }

  async redirect(code: string) {
    const cacheKey = this.redirectCacheKey(code);
    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    const originalUrl = (await this.findByCode(code)).original;
    await this.incrementClicks(code);

    await this.cacheManager.set(cacheKey, originalUrl, days(30));

    return originalUrl;
  }

  async delete(code: string, userId: string) {
    const url = await this.findByCode(code);

    if (url.userId !== userId) {
      throw new ForbiddenException();
    }

    const deletedUrl = await this.prisma.url.delete({
      where: { code },
    });

    await this.cacheManager.del(this.statsCacheKey(code));
    await this.cacheManager.del(this.allUsersCacheKey(userId));
    await this.cacheManager.del(this.redirectCacheKey(code));

    return deletedUrl;
  }
}
