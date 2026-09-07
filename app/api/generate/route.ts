import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { SYSTEM_PROMPT, userPrompt } from "@/lib/prompts/system";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z.enum(["why", "letter"]),
  payload: z.unknown(),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "För många försök just nu. Vänta några minuter och prova igen." },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY saknas. Sätt variabeln i Railway eller i .env.local lokalt." },
      { status: 500 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ogiltig typ." }, { status: 400 });
  }

  const body = parsed.data;
  const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";
  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model,
      instructions: SYSTEM_PROMPT,
      input: userPrompt(body.type, body.payload ?? {}),
      max_output_tokens: 900,
      ...(model.includes("terra") || model.includes("sol")
        ? { reasoning: { effort: "low" as const } }
        : {}),
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Modellen lämnade ingen text." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Kunde inte skapa text just nu.";
    const message = /429|credits remaining|insufficient_quota/i.test(raw)
      ? "Språkstödet är tillfälligt stängt. Försök igen senare."
      : raw;
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
