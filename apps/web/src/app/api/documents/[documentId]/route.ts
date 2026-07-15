import { NextResponse } from "next/server";

import { getDocument, readDocumentBytes } from "@/server/services/document-service";

function contentDisposition(filename: string) {
  const fallback = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `inline; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;
  const document = await getDocument(documentId);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const bytes = await readDocumentBytes(document.storageKey);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": contentDisposition(document.originalName),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Stored document could not be read", error);
    return NextResponse.json({ error: "Stored document is unavailable" }, { status: 404 });
  }
}
