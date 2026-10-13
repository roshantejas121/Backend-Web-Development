# Database Integration Assignment

This project replaces the in-memory post repository with PostgreSQL through Prisma while preserving the existing service, controller, route, response, validation, and not-found contracts.

## Requirements

- Node.js 18+
- PostgreSQL 14+
- A development database named `community_dev` (or another database named in `DATABASE_URL`)

## Safe local setup

```bash
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL to a local PostgreSQL database.
npm run prisma:validate
npm run prisma:generate
npx prisma migrate deploy
npm run seed
npm start
```

`.env` is ignored and must never be committed. Only `.env.example` is tracked.

For a clean local database, use `npm run db:reset`; this is destructive and should only be run against a development database.

## Database design

`prisma/schema.prisma` models users, posts, comments, votes, follows, tags, and the explicit `PostTag` many-to-many join. Foreign keys use deliberate cascade behavior. Votes and follows use composite uniqueness/primary-key rules to prevent duplicates. Lookup paths have indexes for author, post comments, votes, follows, tags, and post creation time.

The committed migration in `prisma/migrations` is the reproducible history for this schema. The application creates one shared `PrismaClient` in `src/db/prisma.js`; Prisma is used only by the repository layer.

## Contract proof

With the database running, the API scenarios remain:

- `GET /posts` returns `{ "data": [] }` or an array of posts.
- `GET /posts/:id` returns the post or the existing 404 response.
- `POST /posts` returns the complete created record with 201.
- `PATCH /posts/:id` returns the updated record or the existing 404 response.
- `DELETE /posts/:id` returns 204 or the existing 404 response.
- A missing author maps the foreign-key failure to a safe 422 message; raw Prisma details are not exposed.

The service and controller files do not import Prisma or use Prisma method names/error codes.

```bash
npm run prisma:format
npm run prisma:validate
```
