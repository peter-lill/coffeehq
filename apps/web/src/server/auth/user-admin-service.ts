import "server-only";
import type { MembershipRole } from "@prisma/client";
import { db } from "@/lib/db";
import { normaliseEmail } from "@/server/auth/authentication-service";
import { hashPassword } from "@/server/auth/password";
import { requireRole } from "@/server/auth/current-user";
import { revokeAllUserSessions } from "@/server/auth/session";
const ADMINS: MembershipRole[] = ["ADMIN"];
export async function listOrganisationUsers() { const actor = await requireRole(ADMINS); return db.membership.findMany({ where: { organisationId: actor.organisationId }, include: { user: true }, orderBy: { createdAt: "asc" } }); }
export async function createOrganisationUser(input: { name: string; email: string; password: string; role: MembershipRole }) {
  const actor = await requireRole(ADMINS); const name = input.name.trim(); const email = normaliseEmail(input.email); if (name.length < 2) throw new Error("Enter the user's full name."); const passwordHash = await hashPassword(input.password);
  return db.$transaction(async tx => { if (await tx.user.findUnique({ where: { email } })) throw new Error("An account already uses that email address."); return tx.user.create({ data: { name, email, passwordHash, isActive: true, mustChangePassword: true, memberships: { create: { organisationId: actor.organisationId, role: input.role } } } }); });
}
export async function updateOrganisationUserRole(input: { userId: string; role: MembershipRole }) { const actor = await requireRole(ADMINS); if (input.userId === actor.id) throw new Error("You cannot change your own administrator role."); return db.membership.update({ where: { organisationId_userId: { organisationId: actor.organisationId, userId: input.userId } }, data: { role: input.role } }); }
export async function resetOrganisationUserPassword(input: { userId: string; password: string }) { const actor = await requireRole(ADMINS); const membership = await db.membership.findUnique({ where: { organisationId_userId: { organisationId: actor.organisationId, userId: input.userId } } }); if (!membership) throw new Error("User account not found."); const passwordHash = await hashPassword(input.password); await db.user.update({ where: { id: input.userId }, data: { passwordHash, mustChangePassword: input.userId !== actor.id, failedLoginAttempts: 0, lockedUntil: null } }); await revokeAllUserSessions(input.userId); }
export async function setOrganisationUserActive(input: { userId: string; active: boolean }) { const actor = await requireRole(ADMINS); if (input.userId === actor.id && !input.active) throw new Error("You cannot deactivate your own account."); const membership = await db.membership.findUnique({ where: { organisationId_userId: { organisationId: actor.organisationId, userId: input.userId } } }); if (!membership) throw new Error("User account not found."); await db.user.update({ where: { id: input.userId }, data: { isActive: input.active } }); if (!input.active) await revokeAllUserSessions(input.userId); }
