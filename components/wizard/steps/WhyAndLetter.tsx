"use client";

import { useMemo } from "react";
import { Alert, Button, Checkbox, ChoiceCard, Field, TextArea } from "@/components/ui";
import { AUDITOR_CORE_PARAGRAPH } from "@/lib/wizard/defaults";
import { letterText } from "@/lib/wizard/export";
import { checkWhyQuality } from "@/lib/wizard/quality";
import { useWizardStore } from "@/lib/wizard/store";
import { useGenerate } from "@/lib/wizard/useGenerate";
import { StepHeader } from "./Stem";

export function WhyStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);
  const { generate, loading, error } = useGenerate();
  const text = state.writeMyself ? state.whyRaw : state.whyGenerated || state.whyRaw;
  const issues = useMemo(() => (text ? checkWhyQuality(text, state) : []), [text, state]);

  const heading =
    state.reason === "exceptional"
      ? "Kort redogörelse"
      : "Varför måste vårdnadshavaren vistas utomlands?";

  return (
    <>
      <StepHeader
        title={heading}
        help="Skolverket läser det här fältet. De vill se att arbetet är orsaken till att ni är utomlands — inte att ni flyttade och sedan jobbar på distans."
      />
      <Alert tone="info">
        Skriv som arbetsgivaren skulle gjort det: vad personen gör, och varför just de uppgifterna
        kräver att hen är på plats. Inte klimat, skatt, skola eller “vi valde Mallorca”. Hellre
        korta meningar än en lång AI-text.
      </Alert>

      <div className="mt-6 space-y-6">
        <Field
          label="Berätta med egna ord, kort"
          hint="Tre till sex meningar. Till exempel: vilka kunder eller uppdrag, vad som görs på plats, varför det inte kan göras från Sverige."
        >
          <TextArea
            value={state.whyRaw}
            onChange={(e) => patch({ whyRaw: e.target.value, whyApproved: false })}
            placeholder="Bolaget har avtal med … som kräver att vårdnadshavaren är på plats i Palma för att …"
          />
        </Field>

        {!state.writeMyself ? (
          <div className="space-y-3">
            <Checkbox checked={state.aiConsent} onChange={(value) => patch({ aiConsent: value })}>
              Förslaget skapas av GPT-5.6 utifrån det ni just fyllt i. Texten skickas till vår
              leverantör, lagras inte för träning och raderas därifrån efter 30 dagar.
            </Checkbox>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!state.aiConsent || !state.whyRaw.trim() || loading}
                onClick={() => generate("why")}
              >
                {loading ? "Skriver förslag…" : state.whyGenerated ? "Skriv om, mer vardagligt" : "Skriv förslag till blanketten"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => patch({ writeMyself: true })}>
                Avstå och skriv själv
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" onClick={() => patch({ writeMyself: false })}>
            Använd språkmodellen i stället
          </Button>
        )}

        {error ? <Alert tone="stop">{error}</Alert> : null}

        {loading ? (
          <div className="space-y-2" aria-live="polite">
            <div className="h-3 animate-pulse rounded bg-line" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-line" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
          </div>
        ) : null}

        {!state.writeMyself && state.whyGenerated ? (
          <Field label="Förslag — du måste läsa och ändra">
            <TextArea
              value={state.whyGenerated}
              onChange={(e) => patch({ whyGenerated: e.target.value, whyApproved: false })}
              className="min-h-[220px]"
            />
          </Field>
        ) : null}

        {state.writeMyself ? (
          <Alert tone="info">
            Skriv under tre rubriker: arbetsuppgifter, varför på plats, period.
          </Alert>
        ) : null}

        {text && issues.length > 0 ? (
          <Alert tone="warn">
            <ul className="list-disc space-y-1 pl-5">
              {issues.map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        {text ? (
          <Checkbox
            checked={state.whyApproved}
            onChange={(value) => patch({ whyApproved: value })}
          >
            Jag har läst texten. Inga påhittade uppdrag, kunder eller datum.
          </Checkbox>
        ) : null}
      </div>
    </>
  );
}

export function LetterStep() {
  const state = useWizardStore();
  const patch = useWizardStore((s) => s.patch);
  const { generate, loading, error } = useGenerate();
  const preview = letterText(state);

  return (
    <>
      <StepHeader
        title="Brev till den som ska skriva under"
        help="Ett vanligt mejl du kan skicka. Kort och sakligt. Inget skickas härifrån."
      />
      <div className="space-y-6">
        <Field label="Mottagare">
          <div className="grid gap-2">
            <ChoiceCard
              title="Revisor"
              selected={state.signerType === "auditor"}
              onSelect={() => patch({ signerType: "auditor" })}
            />
            <ChoiceCard
              title="HR / arbetsgivare"
              selected={state.signerType === "hr"}
              onSelect={() => patch({ signerType: "hr" })}
            />
            <ChoiceCard
              title="Båda varianterna"
              selected={state.signerType === "both"}
              onSelect={() => patch({ signerType: "both" })}
            />
          </div>
        </Field>

        <Checkbox checked={state.aiConsent} onChange={(value) => patch({ aiConsent: value })}>
          Förslaget skapas av GPT-5.6 utifrån era svar. Ni måste läsa igenom det innan ni skickar.
        </Checkbox>

        <Button
          type="button"
          disabled={!state.aiConsent || loading}
          onClick={() => generate("letter")}
        >
          {loading ? "Tar fram brevet…" : "Ta fram brevet"}
        </Button>

        {error ? <Alert tone="stop">{error}</Alert> : null}

        {preview ? (
          <>
            <Field label="Brev">
              <TextArea
                value={state.letterGenerated}
                onChange={(e) => patch({ letterGenerated: e.target.value, letterApproved: false })}
                className="min-h-[280px]"
              />
            </Field>
            <div className="rounded-[14px] bg-pine-soft px-4 py-3 text-[15px] leading-6 text-ink">
              <p className="mb-1 text-[13px] font-medium text-stone">Fast kärnparagraf</p>
              {AUDITOR_CORE_PARAGRAPH}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(preview)}
              >
                Kopiera
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "brev-undertecknare.txt";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Ladda ner .txt
              </Button>
            </div>
            <Checkbox
              checked={state.letterApproved}
              onChange={(value) => patch({ letterApproved: value })}
            >
              Jag har läst brevet och kan skicka det.
            </Checkbox>
          </>
        ) : null}
      </div>
    </>
  );
}
