import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { MINIMUM_PASSWORD_LENGTH } from "@/server/auth/constants";
const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key as Buffer);
    });
  });
}
export function validatePassword(password: string) {
  if (password.length < MINIMUM_PASSWORD_LENGTH) throw new Error(`Password must contain at least ${MINIMUM_PASSWORD_LENGTH} characters.`);
}
export async function hashPassword(password: string) {
  validatePassword(password);
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return ["scrypt", SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString("base64url"), key.toString("base64url")].join("$");
}
export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, n, r, p, encodedSalt, encodedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || Number(n) !== SCRYPT_N || Number(r) !== SCRYPT_R || Number(p) !== SCRYPT_P || !encodedSalt || !encodedHash) return false;
  try {
    const expected = Buffer.from(encodedHash, "base64url");
    const actual = await deriveKey(password, Buffer.from(encodedSalt, "base64url"));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}
