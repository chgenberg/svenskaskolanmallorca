import { NextResponse } from "next/server";
import { clearFiestaSession } from "@/lib/fiesta/auth";

export const runtime = "nodejs";

export async function POST() {
  await clearFiestaSession();
  return NextResponse.json({ ok: true });
}
