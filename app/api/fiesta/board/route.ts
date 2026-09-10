import { NextResponse } from "next/server";
import { fiestaUnlocked } from "@/lib/fiesta/auth";
import {
  getBoard,
  isGroupId,
  joinBoard,
  removeMember,
  setGroupNote,
  updateMember,
} from "@/lib/fiesta/board";

export const runtime = "nodejs";

export async function GET() {
  if (!(await fiestaUnlocked())) {
    return NextResponse.json({ error: "Låst." }, { status: 401 });
  }
  return NextResponse.json(await getBoard());
}

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

  const action = typeof body === "object" && body && "action" in body ? String(body.action) : "";
  const data = body as Record<string, string>;
  const groupId = data.groupId ?? "";
  if (!isGroupId(groupId)) {
    return NextResponse.json({ error: "Välj grupp." }, { status: 400 });
  }

  try {
    if (action === "join") {
      return NextResponse.json(
        await joinBoard({
          groupId,
          name: data.name ?? "",
          role: data.role ?? "",
          done: data.done ?? "",
        }),
      );
    }
    if (action === "update") {
      return NextResponse.json(
        await updateMember({
          groupId,
          memberId: data.memberId ?? "",
          role: data.role,
          done: data.done,
        }),
      );
    }
    if (action === "remove") {
      return NextResponse.json(await removeMember(groupId, data.memberId ?? ""));
    }
    if (action === "note") {
      return NextResponse.json(await setGroupNote(groupId, data.note ?? ""));
    }
    return NextResponse.json({ error: "Okänd åtgärd." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte spara.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
