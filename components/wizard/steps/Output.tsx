"use client";

import { useState } from "react";
import { Alert, Button, Checkbox } from "@/components/ui";
import { attachmentGaps, attachmentSummary, getAttachments } from "@/lib/wizard/attachments";
import { downloadWizardPdf } from "@/lib/wizard/downloadPdf";
import {
  downloadTextFile,
  employerEmail,
  exportBundle,
  fieldGuide,
  formFillInstructions,
  getChecklist,
  officialFormUrl,
} from "@/lib/wizard/export";
import { getPackStatus, getRisks, getStops, statusLabel, whyText } from "@/lib/wizard/gates";
import { useWizardStore } from "@/lib/wizard/store";
import { StepHeader } from "./Stem";

export function ChecklistStep() {
  const state = useWizardStore();
  const toggleAttachment = useWizardStore((s) => s.toggleAttachment);
  const items = getChecklist(state);
  const attachments = getAttachments(state);
  const gaps = attachmentGaps(state);
  const summary = attachmentSummary(state);
  const risks = getRisks(state);
  const stops = getStops(state);

  return (
    <>
      <StepHeader
        title="Det här ska med"
        help="Överst syns vad som är ifyllt. Därunder kryssar ni det som lämnas till skolan — inte här."
      />
      {stops.length > 0 ? (
        <div className="mb-6 space-y-2">
          {stops.map((stop) => (
            <Alert key={stop} tone="stop">
              {stop}
            </Alert>
          ))}
        </div>
      ) : null}
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

      <h3 className="text-[15px] font-semibold text-ink">Ifyllt i Underlaget</h3>
      <ul className="mt-3 space-y-3">
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

      {attachments.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-[15px] font-semibold text-ink">Lämnas till skolan</h3>
          <p className="mt-1 text-[14px] leading-5 text-stone">
            Kryssa när pappret finns. Ladda inte upp handlingar här. Skolan ser luckorna i paketet.
          </p>
          {summary.total > 0 && gaps.length > 0 ? (
            <div className="mt-3">
              <Alert tone="warn">
                {gaps.length} av {summary.total} saknas fortfarande. Skolan ser samma luckor.
              </Alert>
            </div>
          ) : null}
          {summary.total > 0 && gaps.length === 0 ? (
            <div className="mt-3">
              <Alert tone="ok">Alla bilagor ni själva kryssat är markerade som klara.</Alert>
            </div>
          ) : null}
          <ul className="mt-4 space-y-4">
            {attachments.map((item) => (
              <li key={item.id}>
                <Checkbox checked={item.checked} onChange={(value) => toggleAttachment(item.id, value)}>
                  <span className="block font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[14px] leading-5 text-stone">{item.hint}</span>
                </Checkbox>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function PackStep() {
  const state = useWizardStore();
  const status = getPackStatus(state);
  const why = whyText(state);
  const email = employerEmail(state);
  const guide = fieldGuide(state);
  const instructions = formFillInstructions(state);
  const filename = `underlag-${state.studentLastName || "gymnasiet"}`.toLowerCase();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const stops = getStops(state);
  const gaps = attachmentGaps(state);
  const summary = attachmentSummary(state);

  return (
    <>
      <StepHeader
        title="Ert underlag"
        help="Kopiera ifyllnadsguiden och mejlet. Ladda ner PDF:en och fyll sedan i Skolverkets blankett."
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
      {stops.length > 0 ? (
        <div className="mb-6 space-y-2">
          {stops.map((stop) => (
            <Alert key={stop} tone="stop">
              {stop}
            </Alert>
          ))}
        </div>
      ) : null}
      {summary.total > 0 ? (
        <div className="mb-6">
          <Alert tone={gaps.length ? "warn" : "ok"}>
            {gaps.length
              ? `Skolan ser luckor: ${gaps.length} av ${summary.total} bilagor saknas. ${gaps.map((item) => item.label).join(" · ")}`
              : `Alla ${summary.total} bilagor till skolan är ikryssade.`}
          </Alert>
        </div>
      ) : null}

      <div className="space-y-4">
        <ExportCard title="Så fyller du i blanketten" body={instructions} />
        <ExportCard title="Blanketttexten — klistra in i fältet" body={why || "Ingen text ännu."} />
        <ExportCard title="Förslag på mejl till arbetsgivare" body={email} />
        <ExportCard title="Fältguide" body={guide} />
      </div>

      {pdfError ? (
        <div className="mt-4">
          <Alert tone="stop">{pdfError}</Alert>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={pdfBusy}
          onClick={async () => {
            setPdfError(null);
            setPdfBusy(true);
            try {
              await downloadWizardPdf(state);
            } catch {
              setPdfError("Kunde inte skapa PDF just nu.");
            } finally {
              setPdfBusy(false);
            }
          }}
        >
          {pdfBusy ? "Skapar PDF…" : "Ladda ner PDF"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => downloadTextFile(`${filename}.txt`, exportBundle(state))}
        >
          Ladda ner .txt
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

function ExportCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-[16px] border border-line bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-medium text-ink">{title}</h2>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(body)}
          className="text-[14px] text-klint underline"
        >
          Kopiera
        </button>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-[14px] leading-6 text-stone">
        {body}
      </pre>
    </section>
  );
}
