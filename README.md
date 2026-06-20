<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">URL Shortener API</h1>

<p align="center">
  A URL shortening service built with NestJS, TypeScript, Prisma, and PostgreSQL.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue" alt="PostgreSQL" />
</p>

---

## Rate Limiting

This API implements rate limiting to prevent abuse and ensure fair usage:

- **Global limit**: 100 requests per minute across all endpoints
- **Authentication endpoints**:
  - Sign up: 3 requests per minute
  - Sign in: 5 requests per minute
- **URL management endpoints**:
  - Create short URL: 20 requests per minute
  - Delete URL: 10 requests per minute
- **Redirect endpoint**: Exempt from rate limiting to ensure smooth redirection

Rate limits are implemented using NestJS Throttler module with Redis storage for different configurations for various route groups.

---

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* Prisma ORM
* Redis
* Passport JWT
* bcrypt
* class-validator
* class-transformer
* nanoid
* @nestjs/throttler
* helmet
* compression

---

## Run with Docker

From a fresh clone:

```bash
git clone https://github.com/gregsyu/url-shortener.git
cd url-shortener
cp .env.example .env
```

Set `JWT_SECRET` in `.env`:

```env
JWT_SECRET="your-secret-key"
REDIS_URL="redis://redis:6379"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="url_shortener"
```

The Docker Compose file provides the container database URL automatically:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/url_shortener"
```


```bash
docker compose build                                   # build the app image
docker compose up -d db                                # start the database
docker compose run --rm app pnpm prisma migrate deploy # run database migrations
docker compose up -d app                               # start the application:
```

> [!NOTE]
> The API will be available at `http://localhost:3000`.

---

To stop the containers:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

### Production Docker Flow

For production, keep migrations separate from application startup:

```bash
docker compose build
docker compose up -d db
docker compose run --rm app pnpm prisma migrate deploy
docker compose up -d app
```

This avoids running schema changes on every app restart and makes migration failures explicit during deployment.

## Project Setup

### Install dependencies

```bash
pnpm install
```

### Environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/url_shortener"
JWT_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
```

### Database

Generate Prisma Client:

```bash
pnpm prisma generate
```

Apply the schema:

```bash
pnpm prisma db push
```

---

## Running the Application

### Development

```bash
pnpm run start:dev
```

### Production

```bash
pnpm run build
pnpm run start:prod
```

---

## API Endpoints

### Authentication

| Method | Route          | Description           |
| ------ | -------------- | --------------------- |
| POST   | `/auth/signup` | Create account        |
| POST   | `/auth/signin` | Login and receive JWT |
| GET    | `/auth/me`     | Check authentication  |

### URLs

| Method | Route               | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/url`              | Create short URL         |
| GET    | `/:code`            | Redirect to original URL |
| GET    | `/url/:code`        | Get URL statistics       |
| DELETE | `/url/:code`        | Delete URL               |

---

## Example Response

Creating a short URL:

```json
{
  "id": "cmabc123xyz",
  "code": "xY7kLm2",
  "original": "https://google.com",
  "clicks": 0,
  "shortUrl": "http://localhost:3000/xY7kLm2"
}
```
