declare module "unzipper" {
  export type Entry = {
    path: string;
    type: "File" | "Directory";
    compressedSize: number;
    uncompressedSize: number;
    buffer(): Promise<Buffer>;
  };

  export const Open: {
    buffer(input: Buffer): Promise<{ files: Entry[] }>;
  };
}
