import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('signup', () => {
    it('should create a user and return an access token', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      (hash as jest.Mock).mockResolvedValue('hashed-password');

      prismaMock.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
      });

      jwtMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signup({
        email: 'john@example.com',
        password: '123456',
      });

      expect(hash).toHaveBeenCalledWith('123456', 10);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'john@example.com',
          password: 'hashed-password',
        },
      });

      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'john@example.com',
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',
      });
    });

    it('should throw if user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(
        service.signup({
          email: 'john@example.com',
          password: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('signin', () => {
    it('should return an access token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed-password',
      });

      (compare as jest.Mock).mockResolvedValue(true);

      jwtMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signin({
        email: 'john@example.com',
        password: '123456',
      });

      expect(compare).toHaveBeenCalledWith('123456', 'hashed-password');

      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'john@example.com',
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',
      });
    });

    it('should throw if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.signin({
          email: 'john@example.com',
          password: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed-password',
      });

      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signin({
          email: 'john@example.com',
          password: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
