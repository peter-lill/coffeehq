"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { requireSessionUser } from "@/server/auth/current-user";
import { createAuthSession, revokeAllUserSessions, revokeCurrentSession } from "@/server/auth/session";
export async function logoutAction() { await revokeCurrentSession(); redirect("/login"); }
export async function changePasswordAction(formData: FormData) {
  const user = await requireSessionUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next !== String(formData.get("confirmPassword") ?? "")) redirect("/account/password?error=The+new+passwords+do+not+match.");
  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record?.passwordHash || !(await verifyPassword(currentPassword, record.passwordHash))) redirect("/account/password?error=The+current+password+is+incorrect.");
  let passwordHash: string;
  try { passwordHash = await hashPassword(next); } catch (e) { redirect(`/account/password?error=${encodeURIComponent(e instanceof Error ? e.message : "Invalid password.")}`); }
  await db.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } });
  await revokeAllUserSessions(user.id); await createAuthSession(user.id); redirect("/?message=Password+updated");
}
