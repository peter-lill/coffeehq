"use server";
import { redirect } from "next/navigation";
import { authenticateWithPassword } from "@/server/auth/authentication-service";
function safeNext(value: FormDataEntryValue | null) { return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/"; }
export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const result = await authenticateWithPassword({ email, password: String(formData.get("password") ?? "") });
  const next = safeNext(formData.get("next"));
  if (!result.ok) { const p = new URLSearchParams({ error: result.message, email }); if (next !== "/") p.set("next", next); redirect(`/login?${p}`); }
  redirect(result.mustChangePassword ? "/account/password" : next);
}
