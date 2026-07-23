/**
 * CoffeeHQ-specific decision services remain outside the reusable intelligence engine.
 * These services may consume intelligence outputs, but responsibility for applying
 * legislation, policy and liability workflow remains within the WorkCover module.
 */
export const workCoverDecisionServices = [
  "QUALIFICATION_ENGINE",
  "LEGISLATIVE_RULES_ENGINE",
  "DECISION_READINESS",
  "RFD_BUILDER",
  "CLAIM_WORKFLOW",
] as const;

export type WorkCoverDecisionService = (typeof workCoverDecisionServices)[number];
