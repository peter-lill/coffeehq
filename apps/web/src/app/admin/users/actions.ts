"use server";
import type { MembershipRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createOrganisationUser, resetOrganisationUserPassword, setOrganisationUserActive, updateOrganisationUserRole } from "@/server/auth/user-admin-service";
const roles = new Set<MembershipRole>(["ADMIN", "MANAGER", "CLAIMS_REPRESENTATIVE", "REVIEWER", "VIEWER"]);
function roleValue(value: FormDataEntryValue | null) { const role = String(value ?? "") as MembershipRole; if (!roles.has(role)) throw new Error("Select a valid role."); return role; }
function message(error: unknown) { return error instanceof Error ? error.message : "The account could not be updated."; }
export async function createUserAction(formData: FormData) { let result = "User account created."; let key = "message"; try { await createOrganisationUser({ name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? ""), role: roleValue(formData.get("role")) }); revalidatePath("/admin/users"); } catch (e) { result = message(e); key = "error"; } redirect(`/admin/users?${key}=${encodeURIComponent(result)}`); }
export async function updateUserRoleAction(userId: string, formData: FormData) { let result="User role updated."; let key="message"; try { await updateOrganisationUserRole({ userId, role: roleValue(formData.get("role")) }); revalidatePath("/admin/users"); } catch(e){result=message(e);key="error";} redirect(`/admin/users?${key}=${encodeURIComponent(result)}`); }
export async function resetUserPasswordAction(userId: string, formData: FormData) { let result="Password reset. The user must change it at next sign-in."; let key="message"; try { await resetOrganisationUserPassword({ userId, password: String(formData.get("password") ?? "") }); revalidatePath("/admin/users"); } catch(e){result=message(e);key="error";} redirect(`/admin/users?${key}=${encodeURIComponent(result)}`); }
export async function setUserActiveAction(userId: string, active: boolean) { let result=active?"User account activated.":"User account deactivated."; let key="message"; try { await setOrganisationUserActive({ userId, active }); revalidatePath("/admin/users"); } catch(e){result=message(e);key="error";} redirect(`/admin/users?${key}=${encodeURIComponent(result)}`); }
