"use client";

import { Alert, Button } from "@/components/ui";
import {
  downloadTextFile,
  exportBundle,
  fieldGuide,
  getChecklist,
  letterText,
  officialFormUrl,
} from "@/lib/wizard/export";
import { getPackStatus, getRisks, statusLabel, whyText } from "@/lib/wizard/gates";
import { useWizardStore } from "@/lib/wizard/store";
import { StepHeader } from "./Stem";

export function ChecklistStep() {
  const state = useWizardStore();
  const items = getChecklist(state);
  const risks = getRisks(state);

  return (
    <>
      <StepHeader title="Det här ska med" help="Inget krav att kryssa allt. Oifyllda blir kvar i paketet som att göra." />
      {risks.length > 0 ? (
        <div className="mb-6">
          <Alert tone="warn">
            <ul className="list-disc space-y-1 pl-5">
              {risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </Alert>
        </div>
      ) : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.text} className="flex gap-3 text-[16px] leading-6 text-ink">
            <span
              aria-hidden
              className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border ${
                item.done ? "border-ok bg-ok-bg text-ok" : "border-line text-stone"
              }`}
            >
              {item.done ? "✓" : ""}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </>
  );
}

export function PackStep() {
  const state = useWizardStore();
  const status = getPackStatus(state);
  const why = whyText(state);
  const letter = letterText(state);
  const guide = fieldGuide(state);
  const filename = `underlag-${state.studentLastName || "gymnasiet"}.txt`.toLowerCase();

  return (
    <>
      <StepHeader
        title="Ert underlag"
        help="Nästa steg: fyll i Skolverkets PDF med hjälp av fältguiden, få del 2 underskriven, lämna till skolan."
      />
      <div
        className={`mb-6 inline-flex rounded-full px-3 py-1 text-[13px] font-medium ${
          status === "complete"
            ? "bg-ok-bg text-ok"
            : status === "complete_risk"
              ? "bg-warn-bg text-warn"
              : "bg-stop-bg text-stop"
        }`}
      >
        {statusLabel(status)}
      </div>

      <div className="space-y-4">
        <ExportCard
          title="Fältguide"
          body={guide}
          onCopy={() => navigator.clipboard.writeText(guide)}
        />
        <ExportCard
          title="Blanketttexten"
          body={why || "Ingen text ännu."}
          onCopy={() => why && navigator.clipboard.writeText(why)}
        />
        {state.reason === "employment" ? (
          <ExportCard
            title="Brev"
            body={letter || "Inget brev ännu."}
            onCopy={() => letter && navigator.clipboard.writeText(letter)}
          />
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => downloadTextFile(filename, exportBundle(state))}
        >
          Ladda ner allt som .txt
        </Button>
        <a
          href={officialFormUrl(state)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center rounded-xl border border-line bg-card px-5 text-[16px] font-medium text-ink"
        >
          Öppna Skolverkets PDF
        </a>
      </div>

      <p className="mt-6 text-[15px] leading-6 text-stone">
        Beslut kommer via skolan, ofta först i februari–mars. Underlaget är ett stöd från Svenska
        Skolan Mallorca. Skolverket beslutar. Appen är inte Skolverket.
      </p>
    </>
  );
}

function ExportCard({
  title,
  body,
  onCopy,
}: {
  title: string;
  body: string;
  onCopy: () => void;
}) {
  return (
    <section className="rounded-[16px] border border-line bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-medium text-ink">{title}</h2>
        <button type="button" onClick={onCopy} className="text-[14px] text-klint underline">
          Kopiera
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-[14px] leading-6 text-stone">
        {body}
      </pre>
    </section>
  );
}
