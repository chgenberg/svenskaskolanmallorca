"use client";

import type { WizardState } from "./types";

export async function downloadWizardPdf(state: WizardState) {
  const response = await fetch("/api/export-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) {
    throw new Error("Kunde inte skapa PDF.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name = `underlag-${state.studentLastName || "gymnasiet"}`.toLowerCase();
  link.href = url;
  link.download = `${name}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
