import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

function root() {
  return process.env.DOCUMENT_STORAGE_ROOT
    ? path.join(path.resolve(process.env.DOCUMENT_STORAGE_ROOT), "roastery")
    : path.join(process.cwd(), "storage", "roastery");
}

function resolveKey(key: string) {
  const base = root();
  const absolute = path.resolve(base, key);
  if (absolute !== base && !absolute.startsWith(`${base}${path.sep}`)) {
    throw new Error("Invalid Roastery storage key.");
  }
  return absolute;
}

export async function saveRoasteryArchive(filename: string, bytes: Uint8Array) {
  const extension = path.extname(filename).toLowerCase() === ".zip" ? ".zip" : "";
  const key = `${randomUUID()}${extension}`;
  const absolute = resolveKey(key);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes, { flag: "wx" });
  return key;
}

export async function readRoasteryArchive(key: string) {
  return readFile(resolveKey(key));
}

export async function deleteRoasteryArchive(key: string) {
  await rm(resolveKey(key), { force: true });
}
