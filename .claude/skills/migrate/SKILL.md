---
name: migrate
description: Create and apply a new Prisma migration
---

Create and apply a Prisma migration from current schema changes.

Usage: `/migrate <short-description>` — `<short-description>` becomes the migration name (snake_case).

Steps:

1. Show `git diff prisma/schema.prisma` so the user can confirm the schema changes look right.
2. Run `npx prisma migrate dev --name <short-description>`.
3. Verify a new directory appeared in `prisma/migrations/`.
4. Run `npx prisma generate` to refresh the client.
5. Remind the user to commit `prisma/schema.prisma` and the new `prisma/migrations/<timestamp>_<name>/` directory together in a single commit.
