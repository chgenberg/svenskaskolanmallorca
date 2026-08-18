"use client";

import { useState } from "react";
import Link from "next/link";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import { PERSONAS, PERSONA_SECTIONS } from "@/lib/wizard/personas";

export function StartScreen() {
  const [showGrundskola, setShowGrundskola] = useState(false);

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

          <button
            type="button"
            onClick={() => setShowGrundskola((open) => !open)}
            className="block rounded-[16px] border border-line bg-card px-4 py-4 text-left transition-colors hover:border-pine/40"
          >
            <span className="block text-[17px] font-semibold text-ink">Grundskola</span>
            <span className="mt-1 block text-[14px] leading-5 text-stone">Kommer snart</span>
          </button>
        </div>

        {showGrundskola ? (
          <p className="mt-4 text-[14px] leading-6 text-stone">
            Guiden för grundskolan byggs när gymnasieflödet sitter. Samma sorts underlag, annan
            skolform och annan avgiftstabell.
          </p>
        ) : null}

        <p className="mt-8 text-center text-[14px] leading-6 text-stone">
          Ni söker inte själva. Skolan och Hermods skickar underlaget till Skolverket. Vid
          godkännande sänks gymnasieavgiften med 2 200 €.
        </p>
      </div>

      {PERSONA_SECTIONS.map((section) => {
        const personas = PERSONAS.filter((persona) => persona.group === section.group);
        const stop = section.group === "dont";
        return (
          <section key={section.group} className="mt-10 w-full max-w-[720px]">
            <h2 className="text-center text-[15px] font-semibold text-ink">{section.title}</h2>
            <p className="mx-auto mt-2 max-w-[480px] text-center text-[14px] leading-6 text-stone">
              {section.text}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {personas.map((persona) => (
                <Link
                  key={persona.id}
                  href={`/gymnasiet?exempel=${persona.id}`}
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
