import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Connect this route to the existing CoffeeHQ upload/storage service.
 * Do not write the ZIP into /public.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Roastery upload route requires integration with the CoffeeHQ storage service.",
    },
    { status: 501 },
  );
}
