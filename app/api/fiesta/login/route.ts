import { NextResponse } from "next/server";
import { fiestaPasswordConfigured, passwordMatches, setFiestaSession } from "@/lib/fiesta/auth";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 8;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_TRIES) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  if (!fiestaPasswordConfigured()) {
    return NextResponse.json({ error: "Lösenordet är inte satt på servern än." }, { status: 503 });
  }
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "För många försök. Vänta några minuter." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  const password = typeof body === "object" && body && "password" in body ? String(body.password ?? "") : "";
  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Fel lösenord." }, { status: 401 });
  }

  await setFiestaSession();
  return NextResponse.json({ ok: true });
}
