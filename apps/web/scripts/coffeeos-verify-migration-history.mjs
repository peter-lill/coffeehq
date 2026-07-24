import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const migrationsDirectory = path.join(process.cwd(), "prisma", "migrations");
const migrationNamePattern = /^\d{14}_[a-z0-9_]+$/;

async function main() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  const migrationNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (migrationNames.length === 0) {
    throw new Error("No Prisma migrations were found.");
  }

  const invalidNames = migrationNames.filter(
    (name) => !migrationNamePattern.test(name),
  );
  if (invalidNames.length > 0) {
    throw new Error(
      `Invalid migration director${invalidNames.length === 1 ? "y" : "ies"}: ${invalidNames.join(", ")}`,
    );
  }

  const duplicateTimestamps = migrationNames
    .map((name) => name.slice(0, 14))
    .filter((timestamp, index, timestamps) => timestamps.indexOf(timestamp) !== index);
  if (duplicateTimestamps.length > 0) {
    throw new Error(
      `Duplicate migration timestamp(s): ${[...new Set(duplicateTimestamps)].join(", ")}`,
    );
  }

  for (const migrationName of migrationNames) {
    const migrationPath = path.join(
      migrationsDirectory,
      migrationName,
      "migration.sql",
    );
    const sql = await readFile(migrationPath, "utf8");
    if (!sql.trim()) {
      throw new Error(`${migrationName}/migration.sql is empty.`);
    }
  }

  console.log(`Verified ${migrationNames.length} Prisma migration(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
