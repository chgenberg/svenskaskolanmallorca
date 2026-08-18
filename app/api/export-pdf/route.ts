import { NextResponse } from "next/server";
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

  const state = { ...defaultState(), ...(body as Partial<WizardState>) };
  const buffer = await buildPdfBuffer(state, "Underlaget — Svenska Skolan Mallorca");
  const lastName = state.studentLastName || "gymnasiet";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="underlag-${lastName.toLowerCase()}.pdf"`,
    },
  });
}
