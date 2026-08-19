import { NextResponse } from "next/server";
import { filenameFallback, type SchoolTrackId } from "@/lib/tracks/config";
import { defaultState } from "@/lib/wizard/defaults";
import { buildPdfBuffer } from "@/lib/wizard/pdf";
import type { WizardState } from "@/lib/wizard/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  const incoming = body as Partial<WizardState>;
  const track: SchoolTrackId = incoming.schoolTrack === "grundskola" ? "grundskola" : "gymnasiet";
  const state = { ...defaultState(track), ...incoming, schoolTrack: track };
  const buffer = await buildPdfBuffer(state);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="underlag-${filenameFallback(state)}.pdf"`,
    },
  });
}
