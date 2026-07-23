import { describe, expect, it } from "vitest";
import { hashPassword, validatePassword, verifyPassword } from "@/server/auth/password";
describe("CoffeeHQ password security", () => {
  it("hashes and verifies a valid password", async () => { const hash = await hashPassword("correct horse battery staple"); expect(hash).not.toContain("correct horse"); expect(await verifyPassword("correct horse battery staple", hash)).toBe(true); expect(await verifyPassword("wrong password", hash)).toBe(false); });
  it("rejects short passwords", () => { expect(() => validatePassword("short")).toThrow("at least 12"); });
  it("rejects malformed stored hashes", async () => { expect(await verifyPassword("anything", "invalid")).toBe(false); });
});
