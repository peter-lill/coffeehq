import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organisation = await prisma.organisation.upsert({
    where: {
      slug: "coffeehq-development",
    },
    update: {
      name: "CoffeeHQ Development",
    },
    create: {
      name: "CoffeeHQ Development",
      slug: "coffeehq-development",
    },
  });

  console.log(`Development organisation ready: ${organisation.slug}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
