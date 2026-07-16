import { NextResponse } from "next/server";

import { getRawCommunication } from "@/server/services/communication-service";

function contentDisposition(filename: string) {
  const safeFilename = filename.replace(/[\r\n]/g, " ").trim();
  const fallback = safeFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const encoded = encodeURIComponent(safeFilename);
  return `inline; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ communicationId: string }> },
) {
  const { communicationId } = await context.params;

  try {
    const raw = await getRawCommunication({ communicationId });

    if (!raw) {
      return NextResponse.json(
        { error: "Original email not found" },
        { status: 404 },
      );
    }

    return new NextResponse(raw.bytes, {
      headers: {
        "Content-Type": "message/rfc822",
        "Content-Length": String(raw.bytes.byteLength),
        "Content-Disposition": contentDisposition(raw.filename),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Original email could not be read", error);
    return NextResponse.json(
      { error: "Original email is unavailable" },
      { status: 404 },
    );
  }
}
