export type StoredFile = {
  storageKey: string;
  absolutePath: string;
};

export interface StorageProvider {
  save(input: {
    claimId: string;
    originalName: string;
    bytes: Uint8Array;
  }): Promise<StoredFile>;
  read(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}
