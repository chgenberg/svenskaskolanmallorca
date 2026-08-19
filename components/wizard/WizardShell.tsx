"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SchoolLogo } from "@/components/brand/SchoolLogo";
import { Button } from "@/components/ui";
import { TRACKS, type SchoolTrackId } from "@/lib/tracks/config";
import { personaById } from "@/lib/wizard/personas";
import { getStops } from "@/lib/wizard/gates";
import { getSteps, stepIndex } from "@/lib/wizard/steps";
import { useWizardStore, useWizardStoreApi } from "@/lib/wizard/store";
import type { StepId } from "@/lib/wizard/types";
import { canContinue } from "@/lib/wizard/validation";
import { PrivacyPanel } from "./PrivacyPanel";
import { StepView } from "./StepView";

export function WizardShell({ track }: { track: SchoolTrackId }) {
  const store = useWizardStoreApi();
  const hydrated = useWizardStore((s) => s.hydrated);
  const currentStepId = useWizardStore((s) => s.currentStepId);
  const goTo = useWizardStore((s) => s.goTo);
  const next = useWizardStore((s) => s.next);
  const back = useWizardStore((s) => s.back);
  const reset = useWizardStore((s) => s.reset);
  const loadPersona = useWizardStore((s) => s.loadPersona);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const state = useWizardStore();
  const searchParams = useSearchParams();
  const config = TRACKS[track];

  useEffect(() => {
    const finish = () => store.getState().setHydrated(true);
    const unsub = store.persist.onFinishHydration(finish);
    void store.persist.rehydrate();
    if (store.persist.hasHydrated()) finish();
    return unsub;
  }, [store]);

  useEffect(() => {
    if (!hydrated) return;
    const persona = personaById(searchParams.get("exempel"), track);
    if (persona) loadPersona(persona.state);
  }, [hydrated, loadPersona, searchParams, track]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-stone">
        Laddar utkast…
      </main>
    );
  }

  const steps = getSteps(state);
  const index = stepIndex(state);
  const current = steps[index] ?? steps[0];
  const unlocked = new Set(steps.slice(0, index + 1).map((step) => step.id));
  const ready = canContinue(state, currentStepId);
  const stops = getStops(state);
  const blocked = stops.length > 0 && (currentStepId === "employer-form" || currentStepId === "signer");

  return (
    <div className="min-h-dvh px-4 pb-16 pt-6 sm:px-6">
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 text-ink hover:text-pine">
          <SchoolLogo size={48} />
          <span>
            <span className="block text-[12px] font-semibold tracking-[0.1em] text-pine uppercase">
              Svenska Skolan Mallorca
            </span>
            <span className="block text-[16px] font-semibold">Underlaget · {config.label}</span>
          </span>
        </Link>
        <button
          type="button"
          className="text-[14px] text-stone underline hover:text-ink"
          onClick={() => setConfirmReset(true)}
        >
          Radera utkast
        </button>
      </header>

      <nav
        className="mx-auto mt-6 w-full max-w-[720px]"
        aria-label="Steg"
      >
        <ol className="hidden gap-2 overflow-x-auto pb-1 md:flex" role="tablist">
          {steps.map((step, stepNumber) => {
            const active = step.id === currentStepId;
            const enabled = unlocked.has(step.id);
            return (
              <li key={step.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={!enabled}
                  onClick={() => enabled && goTo(step.id)}
                  className={`whitespace-nowrap px-1 pb-1 text-[13px] ${
                    active
                      ? "border-b-2 border-pine font-medium text-pine"
                      : enabled
                        ? "text-stone hover:text-ink"
                        : "text-stone/40"
                  }`}
                >
                  {step.short}
                  <span className="sr-only">, steg {stepNumber + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
          {steps.map((step) => (
            <span
              key={step.id}
              className={`size-1.5 rounded-full ${
                step.id === currentStepId ? "bg-pine" : unlocked.has(step.id) ? "bg-stone/40" : "bg-line"
              }`}
            />
          ))}
        </div>
      </nav>

      <main className="mx-auto mt-6 w-full max-w-[560px] rounded-[20px] bg-card px-6 py-10 shadow-[0_1px_2px_rgb(31_28_22/0.04),0_12px_32px_rgb(31_28_22/0.06)] sm:px-10">
        <div
          key={currentStepId}
          role="tabpanel"
          className="animate-in"
          style={{ animation: "fadeSlide 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <StepView stepId={current.id as StepId} onPrivacy={() => setPrivacyOpen(true)} />
        </div>

        {blocked
          ? stops.map((stop) => (
              <p key={stop} className="sr-only">
                {stop}
              </p>
            ))
          : null}

        <footer className="mt-10 flex items-center justify-between gap-3">
          {index > 0 ? (
            <button type="button" onClick={back} className="text-[16px] text-stone hover:text-ink">
              Tillbaka
            </button>
          ) : (
            <Link href="/" className="text-[16px] text-stone hover:text-ink">
              Till start
            </Link>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-stone">
              Steg {index + 1} av {steps.length}
            </span>
            {currentStepId !== "pack" ? (
              <Button type="button" onClick={next} disabled={!ready || blocked}>
                Fortsätt
              </Button>
            ) : null}
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeSlide {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>

      <PrivacyPanel open={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      {confirmReset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4">
          <div className="w-full max-w-sm rounded-[20px] bg-card p-6">
            <h2 className="font-serif text-[24px] font-semibold text-ink">Radera utkastet?</h2>
            <p className="mt-2 text-[16px] leading-6 text-stone">
              Allt ni fyllt i på den här enheten försvinner.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setConfirmReset(false)}>
                Avbryt
              </Button>
              <Button
                type="button"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Radera
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
