import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { MembershipRole } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { AUTH_COOKIE_NAME, AUTH_SESSION_HOURS } from "@/server/auth/constants";
export type SessionUser = { id: string; name: string; email: string; mustChangePassword: boolean; role: MembershipRole; organisationId: string; organisationName: string };
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export async function createAuthSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + AUTH_SESSION_HOURS * 60 * 60 * 1000);
  const h = await headers();
  await db.authSession.create({ data: { userId, tokenHash: tokenHash(token), expiresAt, userAgent: h.get("user-agent"), ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null } });
  const c = await cookies();
  c.set(AUTH_COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export async function getSessionUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const now = new Date();
  const session = await db.authSession.findFirst({
    where: { tokenHash: tokenHash(token), revokedAt: null, expiresAt: { gt: now }, user: { isActive: true } },
    include: { user: { include: { memberships: { include: { organisation: true }, orderBy: { createdAt: "asc" }, take: 1 } } } },
  });
  const membership = session?.user.memberships[0];
  if (!session || !membership) return null;
  if (now.getTime() - session.lastSeenAt.getTime() > 300_000) await db.authSession.update({ where: { id: session.id }, data: { lastSeenAt: now } });
  return { id: session.user.id, name: session.user.name, email: session.user.email, mustChangePassword: session.user.mustChangePassword, role: membership.role, organisationId: membership.organisationId, organisationName: membership.organisation.name };
}
export async function revokeCurrentSession() {
  const c = await cookies();
  const token = c.get(AUTH_COOKIE_NAME)?.value;
  if (token) await db.authSession.updateMany({ where: { tokenHash: tokenHash(token), revokedAt: null }, data: { revokedAt: new Date() } });
  c.delete(AUTH_COOKIE_NAME);
}
export async function revokeAllUserSessions(userId: string) { return db.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); }
