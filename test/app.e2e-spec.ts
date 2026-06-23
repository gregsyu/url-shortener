import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'nanoid-mocked-1234'),
}));

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  const random = Date.now();

  const user = {
    email: `test-${random}@example.com`,
    password: '123456',
  };

  let accessToken: string;
  let code: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.get(PrismaService).$disconnect();
    await app.close();
  });

  it('should reject UNAUTHENTICATED create', async () => {
    await request(app.getHttpServer())
      .post('/url')
      .send({
        url: 'https://google.com',
      })
      .expect(401);
  });

  it('should reject UNAUTHENTICATED delete', async () => {
    await request(app.getHttpServer()).delete(`/url/${code}`).expect(401);
  });

  it('should reject UNAUTHENTICATED get /url', async () => {
    await request(app.getHttpServer()).get(`/url`).expect(401);
  });

  it('POST /auth/signup', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/signin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(user)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');

    accessToken = response.body.accessToken;
  });

  it('GET /auth/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(user.email);
  });

  it('POST /url', async () => {
    const response = await request(app.getHttpServer())
      .post('/url')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        url: 'https://google.com',
      })
      .expect(201);

    expect(response.body).toHaveProperty('code');

    code = response.body.code;
  });

  it('GET /url', async () => {
    const response = await request(app.getHttpServer())
      .get('/url')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /url/:code', async () => {
    const response = await request(app.getHttpServer())
      .get(`/url/${code}`)
      .expect(200);

    expect(response.body.code).toBe(code);
    expect(response.body.originalUrl).toBe('https://google.com');
  });

  it('GET /:code redirect', async () => {
    const response = await request(app.getHttpServer())
      .get(`/${code}`)
      .redirects(0);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('https://google.com');
  });

  it('DELETE /url/:code', async () => {
    await request(app.getHttpServer())
      .delete(`/url/${code}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /url/:code should return 404 after delete', async () => {
    await request(app.getHttpServer()).get(`/url/${code}`).expect(404);
  });
});
