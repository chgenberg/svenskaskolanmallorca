"use client";

import { useState } from "react";
import Link from "next/link";

export function StartScreen() {
  const [showGrundskola, setShowGrundskola] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px] rounded-[20px] bg-card px-8 py-10 shadow-[0_1px_2px_rgb(31_28_22/0.04),0_12px_32px_rgb(31_28_22/0.06)]">
        <p className="text-center text-[13px] font-medium tracking-wide text-stone">
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
            <span className="block text-[17px] font-medium text-ink">Gymnasiet</span>
            <span className="mt-1 block text-[14px] leading-5 text-stone">
              Hermods Distansgymnasium + skolans handledning
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setShowGrundskola((open) => !open)}
            className="block rounded-[16px] border border-line bg-card px-4 py-4 text-left transition-colors hover:border-pine/40"
          >
            <span className="block text-[17px] font-medium text-ink">Grundskola</span>
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

      <p className="mt-8 max-w-[420px] text-center text-[13px] leading-5 text-stone/80">
        Underlaget är ett stöd från Svenska Skolan Mallorca. Skolverket beslutar. Appen är inte
        Skolverket.
      </p>
    </main>
  );
}
