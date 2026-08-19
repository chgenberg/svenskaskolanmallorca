import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { SchoolTrackId } from "../lib/tracks/config";
import { buildPdfBuffer } from "../lib/wizard/pdf";
import { personasFor } from "../lib/wizard/personas";

async function writeTrack(track: SchoolTrackId) {
  const folder =
    track === "grundskola"
      ? join(homedir(), "Desktop", "Underlaget-exempel", "grundskola")
      : join(homedir(), "Desktop", "Underlaget-exempel");
  mkdirSync(folder, { recursive: true });

  for (const [index, persona] of personasFor(track).entries()) {
    const heading =
      persona.group === "dont"
        ? `Underlaget — gör inte så här: ${persona.title}`
        : `Underlaget — exempel ${index + 1}: ${persona.title}`;
    const buffer = await buildPdfBuffer(persona.state, heading);
    const file = join(folder, `${index + 1}-${persona.id}.pdf`);
    writeFileSync(file, buffer);
    console.log(file);
  }
}

async function main() {
  const arg = process.argv.find((value) => value.startsWith("--track="));
  const requested = arg?.slice("--track=".length);
  if (requested === "grundskola" || requested === "gymnasiet") {
    await writeTrack(requested);
    return;
  }
  await writeTrack("gymnasiet");
  await writeTrack("grundskola");
}

void main();
