# CoffeeOS Deployment Model

## Current model

CoffeeOS is deployed as a Next.js application with PostgreSQL and private document storage. Mail synchronisation may run as a separate process from the same codebase.

## Required release sequence

1. Verify and back up PostgreSQL and document storage.
2. Install dependencies from `package-lock.json`.
3. Validate and generate Prisma Client.
4. Run the migration baseline guard.
5. Apply committed migrations.
6. Run type checking, tests and linting.
7. Build the production application.
8. Start or restart the application and workers.
9. Perform health and access smoke tests.

## Migration baseline handling

`npm run db:prepare-migrations` checks whether the database is blank or already contains the historical CoffeeHQ core/access schema:

- blank database: migrations run normally;
- complete historical schema without the new migration record: the matching baseline is marked applied;
- partial historical schema: deployment stops for manual reconciliation.

This guard prevents the baseline from recreating existing tables while allowing a clean database to be provisioned entirely from source control.

## Rollback

Application rollback does not reverse destructive database migrations. Releases require a verified pre-deployment backup and a documented restore path. Database backups must be held outside the repository tree.
