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

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* Prisma ORM
* Passport JWT
* bcrypt
* class-validator
* class-transformer
* nanoid

---

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