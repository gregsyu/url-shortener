import { Test } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'nanoid-mocked-1234'),
}));

describe('UrlService tests', () => {
  let service: UrlService;

  const prismaMock = {
    url: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  // each `describe`
  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
      ],
    }).compile();

    service = module.get(UrlService);
  });

  describe('create', () => {
    it('should create a URL', async () => {
      prismaMock.url.findUnique.mockResolvedValue(null);

      prismaMock.url.create.mockResolvedValue({
        id: '1',
        code: 'abc123',
        original: 'https://google.com',
        user: 'user1',
      });

      const result = await service.create(
        {
          url: 'google.com',
          customCode: 'abc123',
        },
        'user1',
      );

      expect(prismaMock.url.create).toHaveBeenCalled();
      expect(result.original).toBe('https://google.com');
    });

    it('should throw if custom code already exists', async () => {
      prismaMock.url.findUnique.mockResolvedValue({
        id: '1',
      });

      await expect(
        service.create(
          {
            url: 'google.com',
            customCode: 'abc123',
          },
          'user1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByCode', () => {
    it('should return URL', async () => {
      const url = {
        code: 'abc',
      };

      prismaMock.url.findUnique.mockResolvedValue(url);

      const result = await service.findByCode('abc');

      expect(result).toEqual(url);
    });

    it('should throw when URL does not exist', async () => {
      prismaMock.url.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('abc')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks', async () => {
      prismaMock.url.update.mockResolvedValue({
        code: 'abc',
        clicks: 1,
      });

      await service.incrementClicks('abc');

      expect(prismaMock.url.update).toHaveBeenCalledWith({
        where: { code: 'abc' },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });

      expect(cacheMock.del).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return CACHED stats', async () => {
      const stats = {
        code: 'abc',
        clicks: 5,
      };

      cacheMock.get.mockResolvedValue(stats);

      const result = await service.getStats('abc');

      expect(result).toEqual(stats);
      // can't be called with `findUnique`
      expect(prismaMock.url.findUnique).not.toHaveBeenCalled();
    });

    it('should query database when cache MISSES', async () => {
      cacheMock.get.mockResolvedValue(null);

      prismaMock.url.findUnique.mockResolvedValue({
        code: 'abc',
        original: 'https://google.com',
        clicks: 5,
        createdAt: new Date(),
      });

      const result = await service.getStats('abc');

      expect(result.code).toBe('abc');
      expect(cacheMock.set).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return CACHED urls', async () => {
      const urls = [{ code: 'abc' }];

      cacheMock.get.mockResolvedValue(urls);

      const result = await service.findAllByUser('user1');

      expect(result).toEqual(urls);
    });

    it('should query database on cache MISS', async () => {
      cacheMock.get.mockResolvedValue(null);

      prismaMock.url.findMany.mockResolvedValue([
        { code: 'abc' },
        { code: 'def' },
      ]);

      const result = await service.findAllByUser('user1');

      expect(result).toHaveLength(2);
      expect(cacheMock.set).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete url when owner matches', async () => {
      prismaMock.url.findUnique.mockResolvedValue({
        code: 'abc',
        userId: 'user1',
      });

      prismaMock.url.delete.mockResolvedValue({
        code: 'abc',
      });

      const result = await service.delete('abc', 'user1');

      expect(result.code).toBe('abc');
      expect(cacheMock.del).toHaveBeenCalledTimes(2);
    });

    it('should throw when user is not owner', async () => {
      prismaMock.url.findUnique.mockResolvedValue({
        code: 'abc',
        userId: 'other-user',
      });

      await expect(service.delete('abc', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
