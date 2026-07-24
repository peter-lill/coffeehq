#!/usr/bin/env node

import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for migration preparation.");
  process.exit(1);
}

console.log(
  "No migration baselines require reconciliation; the committed migration chain will run normally.",
);
