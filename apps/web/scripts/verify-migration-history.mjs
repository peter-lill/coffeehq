#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsPath = new URL("../prisma/migrations/", import.meta.url);
const schemaPath = new URL("../prisma/schema.prisma", import.meta.url);

const entries = (await readdir(migrationsPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const expectedFirst = "20260716000000_initial_baseline";
if (entries[0] !== expectedFirst) {
  throw new Error(`Expected ${expectedFirst} to be the first migration; found ${entries[0] ?? "none"}.`);
}

const sqlParts = [];
for (const entry of entries) {
  const migrationPath = join(migrationsPath.pathname, entry, "migration.sql");
  try {
    sqlParts.push(await readFile(migrationPath, "utf8"));
  } catch {
    throw new Error(`Migration ${entry} does not contain migration.sql.`);
  }
}

const allSql = sqlParts.join("\n");
const schema = await readFile(schemaPath, "utf8");
const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((match) => match[1]);
const enums = [...schema.matchAll(/^enum\s+(\w+)\s*\{/gm)].map((match) => match[1]);

const missingModels = models.filter((name) => !allSql.includes(`CREATE TABLE "${name}"`));
const missingEnums = enums.filter((name) => !allSql.includes(`CREATE TYPE "${name}"`));

if (missingModels.length > 0) {
  throw new Error(`Models without a CREATE TABLE migration: ${missingModels.join(", ")}.`);
}
if (missingEnums.length > 0) {
  throw new Error(`Enums without a CREATE TYPE migration: ${missingEnums.join(", ")}.`);
}

const accessMigration = await readFile(
  new URL("../prisma/migrations/20260717020000_claim_access_foundation/migration.sql", import.meta.url),
  "utf8",
);
for (const required of [
  'CREATE TABLE "ClaimAccess"',
  'CREATE TABLE "ClaimAccessAudit"',
  'ADD COLUMN "ownerId"',
]) {
  if (!accessMigration.includes(required)) {
    throw new Error(`Claim-access migration is missing: ${required}.`);
  }
}

console.log(`Migration history verified: ${entries.length} migrations, ${models.length} models, ${enums.length} enums.`);
