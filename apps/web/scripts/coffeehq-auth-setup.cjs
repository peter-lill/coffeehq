/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const { randomBytes, scryptSync } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing from apps/web/.env.");
}

const password = process.env.COFFEEHQ_ADMIN_PASSWORD || "";
if (password.length < 12) {
  throw new Error(
    "COFFEEHQ_ADMIN_PASSWORD must contain at least 12 characters.",
  );
}

const email = (
  process.env.COFFEEHQ_ADMIN_EMAIL || "peter@coffeehq.coffee"
)
  .trim()
  .toLowerCase();
const name = (process.env.COFFEEHQ_ADMIN_NAME || "Peter Lill").trim();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function hashPassword(value) {
  const salt = randomBytes(16);
  const key = scryptSync(value, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return [
    "scrypt",
    16384,
    8,
    1,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

function disableLegacyDevelopmentUserSetting() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const updated = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((line) =>
      line.startsWith("COFFEE_DEV_USER_ID=")
        ? `# ${line} # disabled by CoffeeHQ authentication v0.5`
        : line,
    )
    .join("\n")
    .replace(/\n*$/, "\n");

  fs.writeFileSync(envPath, updated);
}

async function main() {
  const organisation = await prisma.organisation.upsert({
    where: { slug: "coffeehq-development" },
    update: {},
    create: {
      name: "CoffeeHQ Development",
      slug: "coffeehq-development",
    },
  });

  const passwordHash = hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      name,
      email,
      passwordHash,
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.membership.upsert({
    where: {
      organisationId_userId: {
        organisationId: organisation.id,
        userId: user.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      organisationId: organisation.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  const legacyUserId = (process.env.COFFEE_DEV_USER_ID || "").trim();
  let transferredClaims = 0;
  if (legacyUserId && legacyUserId !== user.id) {
    const transferred = await prisma.claim.updateMany({
      where: {
        ownerId: legacyUserId,
        organisationId: organisation.id,
      },
      data: { ownerId: user.id },
    });
    transferredClaims = transferred.count;
  }

  const unownedClaims = await prisma.claim.updateMany({
    where: {
      ownerId: null,
      organisationId: organisation.id,
    },
    data: { ownerId: user.id },
  });

  await prisma.authSession.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  disableLegacyDevelopmentUserSetting();

  console.log(`Administrator ready: ${name} <${email}>`);
  console.log(
    `Assigned ${unownedClaims.count} unowned claim(s) to the administrator.`,
  );
  if (transferredClaims > 0) {
    console.log(
      `Transferred ${transferredClaims} legacy-owned claim(s) to the administrator.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
