import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { buildPdfBuffer } from "../lib/wizard/pdf";
import { PERSONAS } from "../lib/wizard/personas";

async function main() {
  const folder = join(homedir(), "Desktop", "Underlaget-exempel");
  mkdirSync(folder, { recursive: true });

  for (const [index, persona] of PERSONAS.entries()) {
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

void main();
