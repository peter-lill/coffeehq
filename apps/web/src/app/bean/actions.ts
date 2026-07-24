"use server";

import mammoth from "mammoth";
import pdf from "pdf-parse";

import { brewFileNote } from "@/server/bean/engine";

const MAX_SOURCE_LENGTH = 2_000_000;
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(["txt", "docx", "pdf", "rtf"]);

export type ImportedDocument = {
  filename: string;
  extension: string;
  size: number;
  pageCount: number | null;
  text: string;
  characters: number;
  words: number;
  warning: string | null;
};

export async function brewFileNoteAction(source: string) {
  if (source.length > MAX_SOURCE_LENGTH) {
    throw new Error("The source is too large to process in one file note. Reduce it to under 2,000,000 characters.");
  }

  return brewFileNote(source);
}

export async function importDocumentAction(formData: FormData): Promise<ImportedDocument> {
  const uploaded = formData.get("document");
  if (!(uploaded instanceof File)) throw new Error("Select a document to import.");
  if (uploaded.size === 0) throw new Error("The selected document is empty.");
  if (uploaded.size > MAX_FILE_SIZE) throw new Error("The selected document exceeds the 25 MB upload limit.");

  const extension = uploaded.name.split(".").pop()?.toLowerCase() ?? "";
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Unsupported file type. Choose a TXT, DOCX, PDF or RTF file.");
  }

  const buffer = Buffer.from(await uploaded.arrayBuffer());
  let text = "";
  let pageCount: number | null = null;
  let warning: string | null = null;

  if (extension === "txt") {
    text = buffer.toString("utf8");
  } else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
    if (result.messages.length) warning = "The DOCX was imported, but some formatting could not be preserved.";
  } else if (extension === "pdf") {
    const result = await pdf(buffer);
    text = result.text;
    pageCount = result.numpages;
    if (!text.trim()) {
      throw new Error("No selectable text was found in this PDF. It may be scanned and require OCR.");
    }
  } else {
    text = rtfToPlainText(buffer.toString("utf8"));
  }

  text = normaliseImportedText(text);
  if (!text.trim()) throw new Error("No readable text could be extracted from this document.");
  if (text.length > MAX_SOURCE_LENGTH) {
    throw new Error("The extracted document exceeds the 2,000,000 character processing limit.");
  }

  return {
    filename: uploaded.name,
    extension,
    size: uploaded.size,
    pageCount,
    text,
    characters: text.length,
    words: countWords(text),
    warning,
  };
}

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function normaliseImportedText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function rtfToPlainText(value: string) {
  return value
    .replace(/\\par[d]?\b/g, "\n")
    .replace(/\\tab\b/g, "\t")
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => String.fromCharCode(Number.parseInt(match.slice(2), 16)))
    .replace(/\\u(-?\d+)\??/g, (_, code: string) => String.fromCharCode(Number(code) < 0 ? Number(code) + 65536 : Number(code)))
    .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
    .replace(/[{}]/g, "")
    .replace(/\\([{}\\])/g, "$1");
}
