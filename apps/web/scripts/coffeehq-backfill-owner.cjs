/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing from apps/web/.env."
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function setEnvValue(filePath, key, value) {
  let text = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";

  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(text)) {
    text = text.replace(pattern, line);
  } else {
    text = `${text.trimEnd()}\n${line}\n`;
  }

  fs.writeFileSync(filePath, text);
}

async function main() {
  const email =
    process.env.COFFEE_DEV_USER_EMAIL ||
    "peter@coffeehq.coffee";

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Peter Lill",
    },
    create: {
      name: "Peter Lill",
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  console.log(
    `Using CoffeeHQ development user: ${user.name} <${user.email}>`
  );

  const result = await prisma.claim.updateMany({
    where: {
      ownerId: null,
    },
    data: {
      ownerId: user.id,
    },
  });

  setEnvValue(
    path.join(process.cwd(), ".env"),
    "COFFEE_DEV_USER_ID",
    user.id
  );

  console.log(
    `Assigned ${result.count} unowned claim(s) to ${user.name}.`
  );

  console.log(
    `COFFEE_DEV_USER_ID=${user.id} written to apps/web/.env.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
