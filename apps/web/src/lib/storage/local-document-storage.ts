import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { StorageProvider, StoredFile } from "@/lib/storage/storage-provider";

function storageRoot() {
  return process.env.DOCUMENT_STORAGE_ROOT
    ? path.resolve(process.env.DOCUMENT_STORAGE_ROOT)
    : path.join(process.cwd(), "storage");
}

function safeExtension(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : "";
}

function resolveStorageKey(storageKey: string) {
  const root = storageRoot();
  const absolutePath = path.resolve(root, storageKey);

  if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid document storage key");
  }

  return absolutePath;
}

class LocalDocumentStorage implements StorageProvider {
  async save(input: {
    claimId: string;
    originalName: string;
    bytes: Uint8Array;
  }): Promise<StoredFile> {
    const extension = safeExtension(input.originalName);
    const storageKey = path.join("claims", input.claimId, `${randomUUID()}${extension}`);
    const absolutePath = resolveStorageKey(storageKey);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.bytes, { flag: "wx" });

    return { storageKey, absolutePath };
  }

  async read(storageKey: string) {
    return readFile(resolveStorageKey(storageKey));
  }

  async delete(storageKey: string) {
    await rm(resolveStorageKey(storageKey), { force: true });
  }
}

export const documentStorage = new LocalDocumentStorage();
