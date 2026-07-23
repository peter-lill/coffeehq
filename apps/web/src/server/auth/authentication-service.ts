import "server-only";
import { db } from "@/lib/db";
import { LOGIN_LOCK_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/server/auth/constants";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createAuthSession } from "@/server/auth/session";
export function normaliseEmail(value: string) { return value.trim().toLowerCase(); }
export async function authenticateWithPassword(input: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { email: normaliseEmail(input.email) } });
  const now = new Date();
  if (!user || !user.passwordHash || !user.isActive) {
    await hashPassword(input.password.length >= 12 ? input.password : `${input.password}------------`);
    return { ok: false as const, message: "The email address or password is incorrect." };
  }
  if (user.lockedUntil && user.lockedUntil > now) return { ok: false as const, message: "This account is temporarily locked. Try again later." };
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(now.getTime() + LOGIN_LOCK_MINUTES * 60_000) : null;
    await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: lockedUntil ? 0 : attempts, lockedUntil } });
    return { ok: false as const, message: "The email address or password is incorrect." };
  }
  if (!(await db.membership.findFirst({ where: { userId: user.id }, select: { id: true } }))) return { ok: false as const, message: "This account is not assigned to a CoffeeHQ organisation." };
  await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now } });
  await createAuthSession(user.id);
  return { ok: true as const, mustChangePassword: user.mustChangePassword };
}
