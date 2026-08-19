"use client";

import Link from "next/link";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import { SCHOOL_FUTURE_SENTENCE, TRACKS } from "@/lib/tracks/config";
import { PERSONA_SECTIONS, personasFor } from "@/lib/wizard/personas";
import type { SchoolTrackId } from "@/lib/wizard/types";

export function StartScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-5 py-16">
      <div className="w-full max-w-[420px] rounded-[20px] bg-card px-8 py-10 shadow-[0_1px_2px_rgb(44_50_76/0.04),0_12px_32px_rgb(44_50_76/0.08)]">
        <div className="flex justify-center">
          <SchoolLogo size={96} priority />
        </div>
        <p className="mt-5 text-center text-[13px] font-semibold tracking-[0.12em] text-pine uppercase">
          Svenska Skolan Mallorca
        </p>
        <h1 className="font-serif mt-3 text-center text-[32px] font-semibold leading-[38px] text-ink">
          Underlaget
        </h1>
        <p className="mt-3 text-center text-[16px] leading-6 text-stone">
          Hjälp att ta fram underlag för statsbidrag.
        </p>

        <div className="mt-8 grid gap-3">
          <Link
            href="/gymnasiet"
            className="block rounded-[16px] border border-line bg-card px-4 py-4 text-left transition-colors hover:border-pine hover:bg-pine-soft"
          >
            <span className="block text-[17px] font-semibold text-ink">Gymnasiet</span>
            <span className="mt-1 block text-[14px] leading-5 text-stone">
              Hermods Distansgymnasium + skolans handledning
            </span>
          </Link>

          <Link
            href="/grundskola"
            className="block rounded-[16px] border border-line bg-card px-4 py-4 text-left transition-colors hover:border-pine hover:bg-pine-soft"
          >
            <span className="block text-[17px] font-semibold text-ink">Grundskola</span>
            <span className="mt-1 block text-[14px] leading-5 text-stone">
              Förskoleklass och åk 1–9 på plats
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-[14px] leading-6 text-stone">
          Ni söker inte själva. För gymnasiet skickar skolan och Hermods. För grundskolan skickar
          skolan. Vid godkännande sänks avgiften med 2 200 €. {SCHOOL_FUTURE_SENTENCE}
        </p>
      </div>

      <PersonaGallery track="gymnasiet" />
      <PersonaGallery track="grundskola" />

      <p className="mt-10 max-w-[420px] text-center text-[13px] leading-5 text-stone/80">
        Underlaget är ett stöd från{" "}
        <a
          href="https://www.svenskaskolanmallorca.com/"
          className="text-klint underline"
          target="_blank"
          rel="noreferrer"
        >
          Svenska Skolan Mallorca
        </a>
        . Skolverket beslutar. Appen är inte Skolverket.
      </p>
    </main>
  );
}

function PersonaGallery({ track }: { track: SchoolTrackId }) {
  const config = TRACKS[track];
  const hrefBase = track === "grundskola" ? "/grundskola" : "/gymnasiet";

  return (
    <div className="mt-14 w-full max-w-[720px]">
      <p className="text-center text-[13px] font-semibold tracking-[0.12em] text-pine uppercase">
        {config.label}
      </p>
      {PERSONA_SECTIONS.map((section) => {
        const personas = personasFor(track).filter((persona) => persona.group === section.group);
        const stop = section.group === "dont";
        return (
          <section key={`${track}-${section.group}`} className="mt-8">
            <h2 className="text-center text-[15px] font-semibold text-ink">{section.title}</h2>
            <p className="mx-auto mt-2 max-w-[480px] text-center text-[14px] leading-6 text-stone">
              {section.text}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {personas.map((persona) => (
                <Link
                  key={`${track}-${persona.id}`}
                  href={`${hrefBase}?exempel=${persona.id}`}
                  className={`rounded-[16px] border px-4 py-4 text-left transition-colors ${
                    stop
                      ? "border-stop/25 bg-stop-bg/40 hover:border-stop/50"
                      : "border-line bg-card hover:border-pine hover:bg-pine-soft"
                  }`}
                >
                  <span className="block text-[16px] font-semibold text-ink">{persona.title}</span>
                  <span className="mt-1 block text-[13px] leading-5 text-stone">{persona.summary}</span>
                  <span className={`mt-2 block text-[12px] ${stop ? "text-stop" : "text-pine"}`}>
                    {persona.formName}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
