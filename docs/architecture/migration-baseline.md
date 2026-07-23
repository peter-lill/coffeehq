# Prisma Migration Baseline

## Problem corrected

The earlier migration chain began by altering core tables without a committed migration that created those tables. The schema also contained claim-access tables and `Claim.ownerId` without a matching migration.

## Baselines introduced

- `20260716000000_initial_baseline` creates the original CoffeeHQ core schema.
- `20260717020000_claim_access_foundation` creates claim ownership and access records.

The intervening historical migrations continue to add lifecycle, classification and authentication fields in their original order.

## Existing databases

Before `prisma migrate deploy`, run:

```bash
npm run db:prepare-migrations
```

The guard marks a baseline as applied only when all expected historical objects already exist. It fails on partial state. It does not alter business tables.

## Verification

A release is not approved until:

- a blank database reaches the current schema using `prisma migrate deploy`;
- `prisma migrate status` reports no pending migration;
- the current development database is reconciled; and
- backup restoration is tested.
