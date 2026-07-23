import type { MembershipRole } from "@prisma/client";
export const membershipRoleLabels: Record<MembershipRole, string> = { ADMIN: "Administrator", MANAGER: "Customer Manager", CLAIMS_REPRESENTATIVE: "Customer Advisor", REVIEWER: "Reviewer", VIEWER: "Viewer" };
