import { ClaimStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { CreateClaimInput } from "@/server/claims/types";

const DEVELOPMENT_ORGANISATION_SLUG = "coffeehq-development";

export async function ensureDevelopmentOrganisation() {
  return db.organisation.upsert({
    where: { slug: DEVELOPMENT_ORGANISATION_SLUG },
    update: {},
    create: {
      name: "CoffeeHQ Development",
      slug: DEVELOPMENT_ORGANISATION_SLUG,
    },
  });
}

export async function listClaims() {
  const organisation = await ensureDevelopmentOrganisation();

  return db.claim.findMany({
    where: { organisationId: organisation.id },
    orderBy: [{ updatedAt: "desc" }, { claimNumber: "asc" }],
  });
}

export async function findClaimByNumber(claimNumber: string) {
  const organisation = await ensureDevelopmentOrganisation();

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
  const organisation = await ensureDevelopmentOrganisation();

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
  const organisation = await ensureDevelopmentOrganisation();

  return db.claim.groupBy({
    by: ["status"],
    where: { organisationId: organisation.id },
    _count: { _all: true },
  });
}
