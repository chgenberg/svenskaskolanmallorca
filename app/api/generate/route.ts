import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { SYSTEM_PROMPT, userPrompt } from "@/lib/prompts/system";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z.enum(["why", "letter"]),
  payload: z.unknown(),
});

export async function POST(request: Request) {
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

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: "gpt-5.6-terra",
      instructions: SYSTEM_PROMPT,
      input: userPrompt(body.type, body.payload ?? {}),
    });

    const text = response.output_text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Modellen lämnade ingen text." }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunde inte skapa text just nu.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
