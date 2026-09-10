import { NextResponse } from "next/server";
import { fiestaUnlocked } from "@/lib/fiesta/auth";
import { defaultFiestaState, type FiestaState } from "@/lib/fiesta/model";
import { buildFiestaPdf } from "@/lib/fiesta/pdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await fiestaUnlocked())) {
    return NextResponse.json({ error: "Låst." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  const incoming = (body ?? {}) as Partial<FiestaState>;
  const state: FiestaState = {
    ...defaultFiestaState(),
    ...incoming,
    notesByTopic: { ...defaultFiestaState().notesByTopic, ...incoming.notesByTopic },
    roles: { ...defaultFiestaState().roles, ...incoming.roles },
    clips: incoming.clips ?? [],
  };

  const buffer = await buildFiestaPdf(state);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="fiesta-halloween.pdf"',
    },
  });
}
