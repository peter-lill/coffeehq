import { ClaimStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { CreateClaimInput } from "@/server/claims/types";

const DEVELOPMENT_ORGANISATION_SLUG = "coffeehq-development";

async function getDevelopmentOrganisation() {
  const organisation = await db.organisation.findUnique({
    where: {
      slug: DEVELOPMENT_ORGANISATION_SLUG,
    },
  });

  if (!organisation) {
    throw new Error(
      "Development organisation is missing. Run the database seed before starting CoffeeHQ.",
    );
  }

  return organisation;
}

export async function listClaims() {
  const organisation = await getDevelopmentOrganisation();

  return db.claim.findMany({
    where: { organisationId: organisation.id },
    orderBy: [{ updatedAt: "desc" }, { claimNumber: "asc" }],
  });
}

export async function findClaimByNumber(claimNumber: string) {
  const organisation = await getDevelopmentOrganisation();

  return db.claim.findUnique({
    where: {
      organisationId_claimNumber: {
        organisationId: organisation.id,
        claimNumber,
      },
    },
  });
}

export async function createClaim(input: CreateClaimInput) {
  const organisation = await getDevelopmentOrganisation();

  return db.claim.create({
    data: {
      organisationId: organisation.id,
      claimNumber: input.claimNumber,
      claimantName: input.claimantName,
      injury: input.injury,
      status: input.status as ClaimStatus,
      nextAction: input.nextAction,
    },
  });
}

export async function getClaimStatusCounts() {
  const organisation = await getDevelopmentOrganisation();

  return db.claim.groupBy({
    by: ["status"],
    where: { organisationId: organisation.id },
    _count: { _all: true },
  });
}
