#!/usr/bin/env node

import "dotenv/config";
import pg from "pg";
import { spawnSync } from "node:child_process";

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required for migration preparation.");
  process.exit(1);
}

const baselines = [
  {
    migration: "20260717020000_claim_access_foundation",
    tables: ["ClaimAccess", "ClaimAccessAudit"],
    columns: [{ table: "Claim", column: "ownerId" }],
  },
];

async function tableExists(client, name) {
  const result = await client.query(
    "SELECT to_regclass($1) IS NOT NULL AS exists",
    [`\"${name}\"`],
  );
  return result.rows[0].exists;
}

async function columnExists(client, table, column) {
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = $1
         AND column_name = $2
     ) AS exists`,
    [table, column],
  );
  return result.rows[0].exists;
}

async function migrationTableExists(client) {
  return tableExists(client, "_prisma_migrations");
}

async function migrationApplied(client, migration) {
  if (!(await migrationTableExists(client))) return false;
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM "_prisma_migrations"
       WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL
     ) AS exists`,
    [migration],
  );
  return result.rows[0].exists;
}

function markApplied(migration) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    command,
    ["prisma", "migrate", "resolve", "--applied", migration],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    throw new Error(`Unable to mark ${migration} as applied.`);
  }
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const toResolve = [];

  try {
    for (const baseline of baselines) {
      if (await migrationApplied(client, baseline.migration)) continue;

      const checks = [];
      for (const table of baseline.tables) {
        checks.push({ label: `table ${table}`, exists: await tableExists(client, table) });
      }
      for (const item of baseline.columns) {
        checks.push({
          label: `column ${item.table}.${item.column}`,
          exists: await columnExists(client, item.table, item.column),
        });
      }

      const present = checks.filter((item) => item.exists);
      if (present.length === 0) {
        console.log(`${baseline.migration}: objects absent; migration will run normally.`);
        continue;
      }

      if (present.length !== checks.length) {
        const missing = checks.filter((item) => !item.exists).map((item) => item.label);
        throw new Error(
          `${baseline.migration} is in a partial state. Missing: ${missing.join(", ")}. ` +
          "Reconcile the database before running Prisma migrations.",
        );
      }

      if (!(await migrationTableExists(client))) {
        throw new Error(
          `${baseline.migration} objects exist but _prisma_migrations does not. ` +
          "Manual database reconciliation is required.",
        );
      }

      toResolve.push(baseline.migration);
    }
  } finally {
    await client.end();
  }

  for (const migration of toResolve) {
    console.log(`${migration}: historical objects detected; marking baseline applied.`);
    markApplied(migration);
  }

  console.log("Migration baseline preparation complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
