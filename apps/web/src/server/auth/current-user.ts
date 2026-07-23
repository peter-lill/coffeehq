import "server-only";
import type { MembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/server/auth/session";
export type CurrentUser = SessionUser;
export async function getCurrentUser() { return getSessionUser(); }
export async function requireSessionUser(): Promise<CurrentUser> { const user = await getCurrentUser(); if (!user) redirect("/login"); return user; }
export async function requireCurrentUser(): Promise<CurrentUser> { const user = await requireSessionUser(); if (user.mustChangePassword) redirect("/account/password"); return user; }
export async function requireRole(roles: MembershipRole[]) { const user = await requireCurrentUser(); if (!roles.includes(user.role)) redirect("/"); return user; }
